const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Signup forms email whatever address is typed, so bots use them for
 * subscription bombing, which damages the shared sending reputation. With the
 * Worker secret TURNSTILE_SECRET_KEY set, a signup needs a Cloudflare Turnstile
 * token issued for this hostname and form action. Verification fails closed.
 * @param {Request} request
 * @param {string | undefined} secret
 * @param {unknown} token
 * @param {string} action
 */
export async function humanCheckFailed(request, secret, token, action) {
  if (!secret) return false;
  if (typeof token !== "string" || !token || token.length > 2048) return true;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) body.append("remoteip", ip);
  try {
    const response = await fetch(VERIFY_URL, { method: "POST", body });
    const result = await response.json();
    return !(
      result?.success === true &&
      result.hostname === new URL(request.url).hostname &&
      result.action === action
    );
  } catch {
    return true;
  }
}
