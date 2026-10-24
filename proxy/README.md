# Whiskered Proxy

A web proxy for Whiskered, built on [Scramjet](https://github.com/MercuryWorkshop/scramjet) by Mercury Workshop.
It has a browser-style address bar, an **Inspect** button (dev tools inside the page) and a
**Game links** button that lists the direct address of any game embedded on the page, which is handy for itch.io.

## Why it needs its own server

Scramjet needs two things a static site (GitHub Pages, jsDelivr) can't give it:

1. A **Wisp relay**, a small server that actually fetches websites for your browser. That is what `src/index.js` runs.
2. A real **https page** to register its service worker. It won't run inside a sandboxed frame, `file://`, or jsDelivr.

So deploy this folder to a host that runs Node, then open that address in a normal browser tab.

## Deploy on Render (free)

1. Go to <https://render.com>, make an account, choose **New > Blueprint** and pick your `Whiskered` repo.
   It reads `render.yaml` and creates the service. (Or **New > Web Service**: root directory `proxy`,
   build command `npm install`, start command `npm start`.)
2. When it finishes you get an address like `https://whiskered-proxy.onrender.com`. Open it and search for something.
3. Paste that address into `PROXY_URL` near the top of the Accounts section in `index.html` so the **Proxy**
   link shows up in your site's sidebar.

Free Render services go to sleep after about 15 minutes without visitors, so the first load can take a minute.
Any host that runs Node or Docker works (Railway, Fly.io, a VPS). A `Dockerfile` is included.

## Run it on your own computer

```
cd proxy
npm install
npm start
```

Then open <http://localhost:8080>. Note this fetches sites from your own network connection, so it will not get
around a filter on that network. Use a hosted copy for that.

## Options (environment variables)

| Name | What it does |
| --- | --- |
| `PORT` | Port to listen on (default 8080). Hosts usually set this for you. |
| `PROXY_PASSWORD` | If set, visitors get a password box first. Anyone can use an open proxy, so set this if you only want friends on it. |

Safety defaults in `src/index.js`: the relay refuses private and loopback addresses and direct IP connections,
only accepts WebSocket connections from its own pages, and uses a family-safe DNS (1.1.1.3). Change `dns_servers`
to `["1.1.1.1", "1.0.0.1"]` to turn the content filter off.

## Using it

- **Inspect** opens dev tools (Elements, Console, Network) inside the page you're viewing.
- **Game links** lists every game or frame embedded on the page, shown with the real address (not the proxy's
  rewritten one), with **Copy** and **Open here**. On itch.io press **Run game** first, then open the panel.
- A link like `https://your-proxy.example/#https://itch.io` opens straight to a site.

## Limits

Heavy or very new sites may not work, and some sites show CAPTCHAs when visited from a hosting provider's IP address.
Scramjet is experimental software.

## License

AGPL-3.0-or-later, the same as the Scramjet demo app this server is based on. See `LICENSE`.
The source for this folder is public in the Whiskered repository.
