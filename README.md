# Cloudflare HumanClick Quick Install

Server-side click verification for HumanClicks, deployed as a Cloudflare Worker in front of your whole domain. No ad URL changes, no redirect hops, no page-load cost — the click is verified in the background and every paid click gets a tamper-evident transaction receipt.

## One-click deploy

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ConvertiD/cloudflare-humanclick-quick-install)

## After deploy — 3 settings

In the worker's **Settings → Variables and Secrets**:

| Name | Type | Value |
|---|---|---|
| `HUMANCLICKS_ENDPOINT` | Variable | Your ingest URL — HumanClicks implementation guide, step 2 |
| `HUMANCLICKS_API_KEY` | **Secret (encrypted)** | Your account API key |

Then under **Settings → Domains & Routes**, add the route `yourdomain.com/*`.

That's it. Every paid click (gclid, fbclid, msclkid, ttclid, li_fat_id, twclid, or any utm_source) is now verified server-to-server before it touches your analytics.

## Why a Worker and not a tag

- **Fail-open by design.** The click is forwarded with `ctx.waitUntil()`; any error passes the visitor straight through. Verification never blocks traffic.
- **Zero Quality Score impact.** Your ad's Final URL stays `yourdomain.com/page`. No tracking templates, no redirect chains, no destination mismatch flags.
- **The API key never reaches a browser.** It lives as an encrypted Worker secret. The verification call is server-to-server only.

## CLI deploy (alternative)

```bash
npm install
# Edit wrangler.toml: set your route and HUMANCLICKS_ENDPOINT
npx wrangler secret put HUMANCLICKS_API_KEY
npm run deploy
