// Whiskered proxy server: serves the proxy page, the Scramjet files and a Wisp
// relay (the part that actually fetches websites for the browser).
//
// Based on the Scramjet demo app by Mercury Workshop (AGPL-3.0).
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { timingSafeEqual } from "node:crypto";
import { server as wisp, logging } from "@mercuryworkshop/wisp-js/server";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";

import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const require = createRequire(import.meta.url);
const publicPath = fileURLToPath(new URL("../public/", import.meta.url));
const erudaPath = dirname(require.resolve("eruda/package.json"));

// Optional: set PROXY_PASSWORD to ask for a password (browser login box) before
// anyone can use the proxy. The username is ignored.
const PASSWORD = process.env.PROXY_PASSWORD || "";

function authorised(req) {
	if (!PASSWORD) return true;
	const header = req.headers.authorization || "";
	if (!header.startsWith("Basic ")) return false;
	const given = Buffer.from(header.slice(6), "base64").toString();
	const supplied = Buffer.from(given.slice(given.indexOf(":") + 1));
	const wanted = Buffer.from(PASSWORD);
	return supplied.length === wanted.length && timingSafeEqual(supplied, wanted);
}

// Wisp relay settings. Private and loopback addresses are blocked by default,
// so the proxy can't be used to reach the host's internal network.
logging.set_level(logging.NONE);
Object.assign(wisp.options, {
	allow_udp_streams: false,
	allow_direct_ip: false,
	allow_private_ips: false,
	allow_loopback_ips: false,
	// Family-safe DNS (blocks malware and adult sites). Swap for 1.1.1.1 / 1.0.0.1 to turn that off.
	dns_servers: ["1.1.1.3", "1.0.0.3"],
});

const fastify = Fastify({
	serverFactory: (handler) =>
		createServer()
			.on("request", (req, res) => {
				if (!authorised(req)) {
					res.statusCode = 401;
					res.setHeader("WWW-Authenticate", 'Basic realm="Whiskered proxy"');
					res.end("Password needed.");
					return;
				}
				res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
				res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
				handler(req, res);
			})
			.on("upgrade", (req, socket, head) => {
				// Only this site's own pages may use the relay, and only with the password if one is set.
				const origin = req.headers.origin;
				const sameSite = origin && new URL(origin).host === req.headers.host;
				if (req.url.endsWith("/wisp/") && sameSite && authorised(req)) {
					wisp.routeRequest(req, socket, head);
				} else {
					socket.end();
				}
			}),
});

fastify.register(fastifyStatic, { root: publicPath, decorateReply: true });
fastify.register(fastifyStatic, { root: scramjetPath, prefix: "/scram/", decorateReply: false });
fastify.register(fastifyStatic, { root: libcurlPath, prefix: "/libcurl/", decorateReply: false });
fastify.register(fastifyStatic, { root: baremuxPath, prefix: "/baremux/", decorateReply: false });
fastify.register(fastifyStatic, { root: erudaPath, prefix: "/eruda/", decorateReply: false });

fastify.get("/health", (req, reply) => reply.type("text/plain").send("ok"));

fastify.setNotFoundHandler((req, reply) =>
	reply.code(404).type("text/html").send("<h1>Not found</h1><p><a href=\"/\">Back to the proxy</a></p>")
);

const shutdown = () => {
	fastify.close();
	process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const port = parseInt(process.env.PORT || "", 10) || 8080;
fastify.listen({ port, host: "0.0.0.0" }).then(() => {
	console.log(`Whiskered proxy running at http://localhost:${port}`);
});
