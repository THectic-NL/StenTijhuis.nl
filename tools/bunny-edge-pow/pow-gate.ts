// Bunny Edge Script: proof-of-work gate (Anubis-style). Known bots/headless
// clients: hard 403. Non-browser-looking UA: hard 403. Everything else
// without a valid pass: solve a SHA-256 puzzle first. Runs on
// `onClientRequest` so cached pages can't skip it. Fails open on error.

import * as BunnySDK from "@bunny.net/edgescript-sdk";

const PASS_COOKIE = "pow_pass";
const VERIFY_PATH = "/__pow/verify";
const DIFFICULTY = 4;
const CHALLENGE_TTL = 120_000;
const PASS_TTL = 7 * 24 * 3600;
// Good crawlers (Anubis's own default allowlist: TecharoHQ/anubis/data/crawlers/): bypass, no challenge.
const ALLOWLIST_UA = /googlebot|google-inspectiontool|bingbot|qwantify|duckduckbot|applebot|ia_archiver|kagibot|marginalia|mojeekbot/i;
// Headless browsers & non-browser HTTP clients (Anubis's own deny list: data/bots/headless-browsers.yaml,
// custom-async-http-client.yaml, etc.): hard block, no point serving them a JS puzzle they can't run.
const DENY_UA = /headlesschrome|headlesschromium|phantomjs|selenium|lightpanda|puppeteer|playwright|curl\/|wget\/|python-requests|python-urllib|scrapy|go-http-client|okhttp|node-fetch|axios\/|libwww-perl|postmanruntime|apache-httpclient|java\/\d|custom-asynchttpclient/i;

function b64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function key(): Promise<CryptoKey> {
  const raw = Deno.env.get("POW_SECRET");
  if (!raw) throw new Error("POW_SECRET not set");
  return crypto.subtle.importKey("raw", new TextEncoder().encode(raw), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

async function hmac(k: CryptoKey, data: string): Promise<string> {
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(data))));
}

function cookie(header: string | null, name: string): string | null {
  return header?.split(";").map((p) => p.trim().split("=")).find(([k]) => k === name)?.[1] ?? null;
}

async function validPass(k: CryptoKey, header: string | null): Promise<boolean> {
  const [expiry, sig] = (cookie(header, PASS_COOKIE) ?? "").split(".");
  if (!expiry || !sig || Date.now() > Number(expiry)) return false;
  return (await hmac(k, `pass:${expiry}`)) === sig;
}

async function newChallenge(k: CryptoKey): Promise<string> {
  const nonce = b64url(crypto.getRandomValues(new Uint8Array(16)));
  const expiry = String(Date.now() + CHALLENGE_TTL);
  return `${nonce}.${expiry}.${await hmac(k, `${nonce}.${expiry}`)}`;
}

async function challengeValid(k: CryptoKey, token: string): Promise<boolean> {
  const [nonce, expiry, sig] = token.split(".");
  if (!nonce || !expiry || Date.now() > Number(expiry)) return false;
  return (await hmac(k, `${nonce}.${expiry}`)) === sig;
}

function page(token: string): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Just a moment...</title>
<style>body{font-family:system-ui,sans-serif;background:#111;color:#eee;display:flex;min-height:100vh;
align-items:center;justify-content:center}.spin{width:28px;height:28px;border-radius:50%;border:3px solid #444;
border-top-color:#eee;animation:s .8s linear infinite;margin:0 auto 16px}@keyframes s{to{transform:rotate(360deg)}}</style>
</head><body><div style="text-align:center"><div class="spin"></div><p>Verifying your browser&hellip;</p></div>
<script>
(async () => {
  const token = ${JSON.stringify(token)}, prefix = "0".repeat(${DIFFICULTY}), enc = new TextEncoder();
  let nonce = 0, h = "";
  do {
    h = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(token + ":" + nonce))))
      .map(b => b.toString(16).padStart(2, "0")).join("");
    if (!h.startsWith(prefix)) nonce++;
  } while (!h.startsWith(prefix));
  const res = await fetch(${JSON.stringify(VERIFY_PATH)}, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, nonce }),
  });
  if (res.ok) location.reload(); else setTimeout(() => location.reload(), 1500);
})();
</script></body></html>`;
}

async function handle(ctx: { request: Request }): Promise<Request | Response> {
  try {
    const { request } = ctx;
    const url = new URL(request.url);
    const k = await key();

    if (url.pathname === VERIFY_PATH && request.method === "POST") {
      const body = await request.json().catch(() => null) as { token?: string; nonce?: number } | null;
      if (!body?.token || body.nonce === undefined) return new Response("bad request", { status: 400 });
      if (!(await challengeValid(k, body.token))) return new Response("invalid", { status: 403 });

      const h = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${body.token}:${body.nonce}`)));
      if (!h.startsWith("0".repeat(DIFFICULTY))) return new Response("invalid", { status: 403 });

      const expiry = String(Date.now() + PASS_TTL * 1000);
      const passSig = await hmac(k, `pass:${expiry}`);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
          "set-cookie": `${PASS_COOKIE}=${expiry}.${passSig}; Path=/; Max-Age=${PASS_TTL}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }

    if (request.method !== "GET" && request.method !== "HEAD") return request;

    const ua = request.headers.get("user-agent") ?? "";
    if (ALLOWLIST_UA.test(ua)) return request;
    if (DENY_UA.test(ua) || !/mozilla|opera/i.test(ua)) return new Response("Forbidden", { status: 403 });
    if (await validPass(k, request.headers.get("cookie"))) return request;

    return new Response(page(await newChallenge(k)), {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    });
  } catch (err) {
    console.error("pow-gate error, failing open:", err);
    return ctx.request;
  }
}

BunnySDK.net.http.servePullZone().onClientRequest(handle);
