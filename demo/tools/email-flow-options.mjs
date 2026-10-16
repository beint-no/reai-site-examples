import { pathToFileURL } from "node:url";

const siteName = "ReAI sin test-nettbutikk";

export async function configureAbandonedCheckout(management, { apply = false } = {}) {
  const sites = (await management("/api/sites")).filter((site) => site.name === siteName);
  if (sites.length !== 1) throw new Error("Expected exactly one dedicated demo Site.");
  const site = sites[0];
  if (site.status !== "enabled" || site.activeDomain !== "nettbutikk.reai.no") throw new Error("Demo Site status/domain differs from the reviewed Site.");
  const flows = await management("/api/email-marketing/flows");
  const matches = flows.filter((flow) => flow.siteId === site.id && flow.kind === "abandoned_checkout");
  if (matches.length !== 1) throw new Error("Expected exactly one abandoned_checkout flow for the demo Site.");
  const flow = matches[0];
  if (!apply) return { mode: "plan", site: site.name, siteId: site.id, flowId: flow.id, kind: flow.kind, enabled: flow.enabled, activatedAt: flow.activatedAt };
  if (flow.enabled) return { mode: "applied", changed: false, siteId: site.id, flowId: flow.id, enabled: true };
  const updated = await management(`/api/email-marketing/flows/${flow.id}`, "PUT", {
    enabled: true,
    subject: flow.subject,
    headline: flow.headline,
    body: flow.body,
    buttonLabel: flow.buttonLabel,
  });
  if (!updated.enabled) throw new Error("Abandoned checkout flow did not become enabled.");
  return { mode: "applied", changed: true, siteId: site.id, flowId: updated.id, enabled: updated.enabled, activatedAt: updated.activatedAt };
}

async function main() {
  const args = process.argv.slice(2);
  const tenantId = args[args.indexOf("--tenant-id") + 1];
  if (args.includes("--apply") && !/^\d+$/.test(tenantId || "")) throw new Error("Supply an authorized --tenant-id for --apply.");
  const api = new URL(process.env.REAI_API_BASE_URL || "https://app.reai.no");
  if (!["app.reai.no", "app-test.reai.no"].includes(api.hostname) || api.protocol !== "https:") throw new Error("Use an approved ReAI HTTPS API origin.");
  const token = process.env.REAI_USER_API_TOKEN;
  if (!token) throw new Error("Set REAI_USER_API_TOKEN locally; do not pass it as an argument.");
  async function management(route, method = "GET", body) {
    const response = await fetch(new URL(route, api.origin), { method, headers: { Authorization: `Bearer ${token}`, "X-Tenant-Id": tenantId, ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`${method} ${route}: HTTP ${response.status}; verify tenant access and email-marketing setup.`);
    return response.status === 204 ? null : response.json();
  }
  console.log(JSON.stringify(await configureAbandonedCheckout(management, { apply: args.includes("--apply") }), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
