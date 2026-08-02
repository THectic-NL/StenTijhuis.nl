# Bunny Edge PoW gate

`pow-gate.ts` is a small proof-of-work challenge for this Pull Zone, in the
same spirit as [Anubis](https://github.com/TecharoHQ/anubis) (what GitLab and
lore.kernel.org run) — a visitor without a valid pass has to solve a SHA-256
puzzle in their browser before they get the real page. One human visitor pays
that cost once and gets a 7-day cookie; a scraper hitting thousands of pages
pays it every time it doesn't send the cookie back.

This is **not** a port of Anubis. Anubis is a standalone Go reverse proxy with
its own bot-policy engine; this is ~150 lines of Deno running as a [Bunny Edge
Script](https://bunny.net/edge-scripting/) middleware, built to fit Bunny's
model instead. Same idea, much smaller scope.

## What it does and doesn't protect against

- Bunny **Shield**'s bot-category blocking (AI scrapers, AI tools, etc. — see
  the Pull Zone's Shield settings) already runs upstream of this script and
  does real IP/reverse-DNS bot verification. This script is a second,
  independent layer for anything that gets past Shield or that Shield isn't
  configured to block.
- The search-engine allowlist and the headless-browser/HTTP-client denylist in
  `pow-gate.ts` are both UA-string matches, spoofable in principle — same
  trade-off Anubis's own default bot policy makes (its actual deny/allow
  lists at [TecharoHQ/anubis](https://github.com/TecharoHQ/anubis/tree/main/data)
  are where these patterns come from). Real verification for the allowlisted
  search engines already happens in Shield; this is just here so a plain UA
  check doesn't accidentally challenge (and thus risk de-indexing) one of
  them.
- Any request whose User-Agent doesn't even try to look like a browser (no
  "Mozilla"/"Opera" token) gets a hard 403, no puzzle — pointless to serve a
  JS challenge to something that can't run JS.
- It does nothing against a scraper that's willing to run a real headless
  browser with a spoofed UA and pay the PoW cost per page. That's the same
  ceiling Anubis has; the point is raising cost per page, not making
  scraping impossible.

## Setup

1. **Set the signing secret.** The script needs a `POW_SECRET` environment
   secret (used to HMAC-sign challenges and pass cookies so they can't be
   forged). Via the Bunny CLI:
   ```bash
   bunny scripts env set POW_SECRET "$(openssl rand -base64 32)" --secret
   ```
   or set it in the dashboard under **Edge Platform → Scripting → (this
   script) → Variables**. Never commit this value.

2. **Deploy the script** — push this repo with Bunny's GitHub integration
   connected (Edge Platform → Scripting → connect repo), or `bunny deploy`
   from the CLI.

3. **Attach it to the Pull Zone as `onClientRequest` middleware.** This is the
   pre-cache hook (fires on every request, cache hit or miss) — deliberately
   *not* `onOriginRequest`, which only fires on cache misses and would let a
   cached page skip the check entirely once warm. As of writing,
   `onClientRequest` is a **Preview** feature in Bunny's dashboard — enable it
   for this Pull Zone under the Edge Scripting settings before attaching.

## Before it goes live on real traffic

I couldn't test this against actual Bunny infrastructure (no account access
in the environment that wrote it) — `onClientRequest` behavior, cookie
handling, and the SDK surface here are all built from bunny.net's docs, not a
live run. Concretely, before trusting it in front of your only site:

- Try it on a low-traffic path or a staging Pull Zone first if you have one.
- Confirm a fresh incognito visit shows the "Verifying your browser…" page
  once, then loads the real site with a `pow_pass` cookie set.
- Confirm plain `curl` (default UA, no "Mozilla" token) gets a 403.
- Confirm `curl -A "Mozilla/5.0"` (browser-y UA, no cookie) gets the challenge
  page, not real content.
- Confirm `curl -A "Googlebot"` gets real content straight away.
- The script fails **open** on any internal error (see the top-level
  try/catch in `pow-gate.ts`) — if something's wrong, the symptom should be
  "gate isn't running" (check the Edge Script's request logs), not "site is
  down." If you ever see the site itself down, detaching the middleware in
  the Pull Zone settings immediately reverts to normal serving.
- The last line, `BunnySDK.net.http.servePullZone().onClientRequest(handle)`,
  is written for attaching as middleware to a Pull Zone that already has its
  origin configured (the Storage zone, same as today). If the dashboard flow
  you use to attach it expects `servePullZone({ url: "..." })` with an
  explicit origin instead, add that — I couldn't confirm which shape applies
  to an existing Pull Zone vs. a from-scratch standalone script from the docs
  alone.

## Tuning

Constants at the top of `pow-gate.ts`:

- `DIFFICULTY` — required leading hex-zero nibbles in the hash (default `4`,
  ~65k hashes average, sub-second on any real browser). Raise it if you want
  scraping to cost more; every +1 roughly ×16's the average work.
- `PASS_TTL` — how long a solved pass is honored, in seconds (default 7 days).
- `CHALLENGE_TTL` — how long a visitor has to solve one challenge before it
  expires, in milliseconds (default 2 minutes).
- `ALLOWLIST_UA` — crawlers that bypass the challenge outright.
- `DENY_UA` — headless browsers / non-browser HTTP clients that get a hard
  403 instead of a challenge. Both lists are extendable regexes; see
  [TecharoHQ/anubis/data](https://github.com/TecharoHQ/anubis/tree/main/data)
  for a much larger reference set to pull more patterns from.

## Reusing this on another Pull Zone

The script is domain-agnostic (no hardcoded hostnames), so the same file
works unchanged on THectic.nl's Pull Zone — see
`THectic.nl/tools/bunny-edge-pow/`. Each Pull Zone still needs its own
`POW_SECRET` set independently; don't reuse one secret across sites.
