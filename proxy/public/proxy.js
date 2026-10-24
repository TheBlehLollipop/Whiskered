"use strict";
(function () {
	const $ = (id) => document.getElementById(id);
	const stage = $("stage"), homeView = $("home-view"), address = $("address"), status = $("status");
	const inspectBtn = $("inspect"), linksBtn = $("links"), panel = $("links-panel"), list = $("links-list");

	const { ScramjetController } = $scramjetLoadController();
	const scramjet = new ScramjetController({
		files: { wasm: "/scram/scramjet.wasm.wasm", all: "/scram/scramjet.all.js", sync: "/scram/scramjet.sync.js" },
	});
	const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

	let frame = null, ready = null, inspecting = false, erudaSource = "", scanTimer = null;
	// Scramjet sets up its storage first; the service worker is registered after that.
	const initDone = scramjet.init();
	initDone.catch(() => {});

	function toast(msg) {
		const t = $("toast");
		t.textContent = msg;
		t.classList.add("show");
		clearTimeout(toast.timer);
		toast.timer = setTimeout(() => t.classList.remove("show"), 2600);
	}
	function say(msg, isError) {
		status.textContent = msg || "";
		status.classList.toggle("error", !!isError);
	}

	/* ---- setup: service worker, Scramjet and the Wisp relay ---- */
	function setup() {
		if (ready) return ready;
		ready = (async () => {
			if (!("serviceWorker" in navigator)) throw new Error("This browser can't run the proxy (no service worker support). Open this page over https.");
			await initDone;
			await navigator.serviceWorker.register("/sw.js", { scope: "/" });
			await navigator.serviceWorker.ready;
			const wisp = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
			if ((await connection.getTransport()) !== "/libcurl/index.mjs") {
				await connection.setTransport("/libcurl/index.mjs", [{ websocket: wisp }]);
			}
		})();
		ready.catch(() => { ready = null; });
		return ready;
	}

	/* ---- turn what was typed into an address ---- */
	function toUrl(text) {
		text = text.trim();
		if (!text) return null;
		if (/^https?:\/\//i.test(text)) { try { return new URL(text).href; } catch (e) {} }
		if (!/\s/.test(text) && /^[^\s/]+\.[a-z]{2,}([/?#:].*)?$/i.test(text)) { try { return new URL("https://" + text).href; } catch (e) {} }
		return "https://duckduckgo.com/?q=" + encodeURIComponent(text);
	}

	function getFrame() {
		if (frame) return frame;
		frame = scramjet.createFrame();
		frame.frame.id = "frame";
		frame.frame.setAttribute("allow", "fullscreen; autoplay; clipboard-write; gamepad; microphone; camera");
		stage.appendChild(frame.frame);
		frame.addEventListener("urlchange", (e) => { address.value = e.url; resetInspect(); });
		frame.frame.addEventListener("load", resetInspect);
		return frame;
	}

	async function go(text) {
		const url = toUrl(text);
		if (!url) return;
		say("Loading...");
		try {
			await setup();
			homeView.hidden = true;
			address.value = url;
			getFrame().go(url);
			say("");
		} catch (err) {
			homeView.hidden = false;
			say("Could not start the proxy: " + (err && err.message ? err.message : err), true);
		}
	}

	/* ---- toolbar ---- */
	$("address-form").addEventListener("submit", (e) => { e.preventDefault(); go(address.value); });
	$("home-form").addEventListener("submit", (e) => { e.preventDefault(); go($("home-address").value); });
	document.querySelectorAll(".quick button").forEach((b) => b.addEventListener("click", () => go(b.dataset.url)));
	$("back").addEventListener("click", () => frame && frame.back());
	$("forward").addEventListener("click", () => frame && frame.forward());
	$("reload").addEventListener("click", () => frame && frame.reload());
	$("home").addEventListener("click", () => { homeView.hidden = false; if (frame) frame.frame.remove(), (frame = null); address.value = ""; resetInspect(); });

	/* ---- dev tools (Eruda) inside the proxied page ---- */
	function resetInspect() { inspecting = false; inspectBtn.classList.remove("on"); }
	async function toggleInspect() {
		if (!frame) return toast("Open a page first");
		const win = frame.frame.contentWindow;
		if (!win) return;
		if (inspecting) {
			try { win.eruda.destroy(); } catch (e) {}
			resetInspect();
			return;
		}
		try {
			if (!erudaSource) erudaSource = await (await fetch("/eruda/eruda.js")).text();
			const doc = win.document;
			const s = doc.createElement("script");
			s.textContent = erudaSource + "\n;window.eruda && eruda.init({ defaults: { displaySize: 55, transparency: 1 } }); window.eruda && eruda.show();";
			(doc.head || doc.documentElement).appendChild(s);
			inspecting = true;
			inspectBtn.classList.add("on");
		} catch (err) {
			toast("Dev tools couldn't open on this page");
		}
	}
	inspectBtn.addEventListener("click", toggleInspect);

	/* ---- game link finder ---- */
	function original(el) {
		let raw = "";
		try { raw = el.getAttribute("src") || el.getAttribute("data") || ""; } catch (e) {}
		try {
			const abs = new URL(raw, location.href).href;
			if (abs.indexOf(location.origin + "/") === 0 && abs.indexOf("/scramjet/") > -1) return scramjet.decodeUrl(abs);
			return abs;
		} catch (e) {}
		try { return el.src || raw; } catch (e) { return raw; }
	}
	function collect(doc, out, depth) {
		if (!doc || depth > 4) return;
		doc.querySelectorAll("iframe, embed, object").forEach((el) => {
			const url = original(el);
			if (url && !/^(about:|javascript:|data:|blob:)/i.test(url)) out.push({ kind: el.tagName.toLowerCase(), url });
			if (el.tagName === "IFRAME") { try { collect(el.contentDocument, out, depth + 1); } catch (e) {} }
		});
	}
	function scan() {
		const out = [];
		if (frame) { try { collect(frame.frame.contentDocument, out, 0); } catch (e) {} }
		const seen = new Set();
		const items = out.filter((x) => !seen.has(x.url) && seen.add(x.url));
		const key = items.map((x) => x.url).join("\n");
		if (scan.last === key) return;
		scan.last = key;
		list.textContent = "";
		if (!items.length) {
			const li = document.createElement("li");
			li.className = "empty";
			li.textContent = frame ? "No embedded games or frames found on this page yet." : "Open a page first.";
			list.appendChild(li);
			return;
		}
		items.forEach((x) => {
			const li = document.createElement("li");
			li.className = "link-item";
			const kind = document.createElement("span"); kind.className = "kind"; kind.textContent = x.kind;
			const url = document.createElement("span"); url.className = "url"; url.textContent = x.url;
			const row = document.createElement("div"); row.className = "row";
			const copy = document.createElement("button"); copy.type = "button"; copy.textContent = "Copy";
			copy.addEventListener("click", async () => {
				try { await navigator.clipboard.writeText(x.url); toast("Copied"); }
				catch (e) { const r = document.createRange(); r.selectNodeContents(url); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); toast("Selected. Press Ctrl+C"); }
			});
			const open = document.createElement("button"); open.type = "button"; open.textContent = "Open here";
			open.addEventListener("click", () => go(x.url));
			row.appendChild(copy); row.appendChild(open);
			li.appendChild(kind); li.appendChild(url); li.appendChild(row);
			list.appendChild(li);
		});
	}
	function togglePanel(show) {
		panel.hidden = !show;
		linksBtn.classList.toggle("on", show);
		clearInterval(scanTimer);
		if (show) { scan.last = null; scan(); scanTimer = setInterval(scan, 1000); }
	}
	linksBtn.addEventListener("click", () => togglePanel(panel.hidden));
	$("links-close").addEventListener("click", () => togglePanel(false));

	/* open straight from a link: /#https://example.com */
	if (location.hash.length > 1) go(decodeURIComponent(location.hash.slice(1)));
})();
