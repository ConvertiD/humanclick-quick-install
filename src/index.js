/**
 * HumanClicks — passive edge click verification.
 *
 * Deploy on a route that covers your whole site, e.g. example.com/*
 * Visitors are never blocked or delayed: the click is forwarded in the
 * background with ctx.waitUntil() and any error passes traffic through.
 *
 * Required Worker settings (Settings → Variables and Secrets):
 *   Variable  HUMANCLICKS_ENDPOINT = your HumanClicks ingest URL
 *   Secret    HUMANCLICKS_API_KEY  = your account API key (encrypt this one)
 *
 * Both values come from your HumanClicks implementation guide, step 2.
 */
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const clickId =
        url.searchParams.get("gclid") ||
        url.searchParams.get("fbclid") ||
        url.searchParams.get("msmkid") ||
        url.searchParams.get("ttclid") ||
        url.searchParams.get("li_fat_id") ||
        url.searchParams.get("twclid");

      const isPaidClick = Boolean(clickId || url.searchParams.get("utm_source"));

      if (isPaidClick) {
        const payload = {
          campaignId: url.searchParams.get("utm_campaign") || "unattributed",
          adId: url.searchParams.get("utm_content") || "unattributed",
          source: url.searchParams.get("utm_source") || "paid",
          clickId: clickId || "",
          landingUrl: request.url,
          referer: request.headers.get("referer") || "",
        };

        ctx.waitUntil(
          fetch(env.HUMANCLICKS_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": env.HUMANCLICKS_API_KEY,
              "User-Agent": request.headers.get("user-agent") || "",
              "X-Forwarded-For": request.headers.get("cf-connecting-ip") || "",
            },
            body: JSON.stringify(payload),
          }).catch(() => {}),
        );
      }
    } catch {
      // Fail open — verification never interrupts site traffic.
    }

    return fetch(request);
  },
};

