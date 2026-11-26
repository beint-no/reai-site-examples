// Forms that email a typed address opt in with data-turnstile="<public site key>"
// and data-turnstile-action. The Cloudflare Turnstile widget loads on first focus,
// stays invisible unless Cloudflare needs a visible check, and each token is single-use.
let loader;
const load = () =>
  (loader ||= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error());
    script.onerror = () => {
      loader = undefined;
      script.remove();
      reject(new Error("Turnstile unavailable"));
    };
    document.head.append(script);
  }));
const checks = new WeakMap();
const humanCheck = (form) => {
  const sitekey = form.dataset.turnstile;
  if (!sitekey) return undefined;
  let check = checks.get(form);
  if (check) return check;
  check = { token: "", waiters: [], widget: undefined };
  checks.set(form, check);
  const settle = (token) => {
    check.token = token;
    if (token) check.waiters.splice(0).forEach((resolve) => resolve(token));
  };
  check.ready = load()
    .then((turnstile) => {
      const container = document.createElement("div");
      container.className = "turnstile-widget";
      form.append(container);
      check.widget = turnstile.render(container, {
        sitekey,
        action: form.dataset.turnstileAction,
        appearance: "interaction-only",
        "response-field": false,
        language: /^(?:nb|nn|no)(?:-|$)/i.test(document.documentElement.lang)
          ? "nb"
          : "en",
        callback: settle,
        "expired-callback": () => settle(""),
        "error-callback": () => settle(""),
      });
      return true;
    })
    .catch(() => {
      checks.delete(form);
      return false;
    });
  return check;
};
document
  .querySelectorAll("[data-turnstile]")
  .forEach((form) =>
    form.addEventListener("focusin", () => humanCheck(form), { once: true }),
  );
/** Resolves to a token, "" when unavailable, or undefined for forms without a site key. */
export async function humanToken(form) {
  const check = humanCheck(form);
  if (!check) return undefined;
  if (!(await check.ready)) return "";
  if (check.token) return check.token;
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(""), 30_000);
    check.waiters.push((token) => {
      clearTimeout(timer);
      resolve(token);
    });
  });
}
/** Call after every submit: tokens are single-use. */
export function spendHumanToken(form) {
  const check = checks.get(form);
  if (check?.widget === undefined || !window.turnstile) return;
  check.token = "";
  window.turnstile.reset(check.widget);
}
