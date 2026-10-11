import { machines, packs, unitPrice, comparisonRows } from "./discovery-model.js";
const root = document.querySelector("[data-comparison-lab]");
if(root) {
  const nb = document.body.dataset.locale === "nb", t = (a,b) => nb ? a : b;
  const el = (tag, text) => { const n = document.createElement(tag); if(text != null) n.textContent = text; return n; };
  const checks = [...root.querySelectorAll("[data-compare-product]")], result = root.querySelector("[data-compare-result]"), show = root.querySelector("[data-compare-show]");
  const selected = () => machines.filter((p) => checks.find((c) => c.value === p.id).checked);
  function render() {
    const items = selected(), tray = root.querySelector("[data-compare-selected]"); tray.replaceChildren();
    root.querySelector("[data-compare-count]").textContent = `${items.length} / 3 ${t("valgt · minst 2 for sammenligning", "selected · at least 2 to compare")}`;
    show.disabled = items.length < 2; if(show.disabled) result.hidden = true;
    items.forEach((p) => { const b = el("button", p.name + " ×"); b.type = "button"; b.setAttribute("aria-label", t("Fjern ","Remove ") + p.name); b.addEventListener("click", () => { const c = checks.find((c) => c.value === p.id); c.checked = false; render(); c.focus(); }); tray.append(b); });
    const head = root.querySelector("[data-compare-head]"), body = root.querySelector("[data-compare-body]"); head.replaceChildren(); body.replaceChildren();
    const tr = el("tr"), label = el("th", t("Egenskap","Specification")); label.scope = "col"; tr.append(label);
    items.forEach((p) => { const th = el("th", p.name); th.scope = "col"; tr.append(th); }); head.append(tr);
    comparisonRows(items,root.querySelector("[data-compare-differences]").checked).forEach((row) => { const tr = el("tr"), th = el("th",row.label[nb ? 0 : 1]); th.scope = "row"; tr.append(th); items.forEach((p) => tr.append(el("td",p[row.key] == null ? t("Ukjent","Unknown") : `${new Intl.NumberFormat(nb ? "nb-NO" : "en").format(p[row.key])} ${row.unit}`))); body.append(tr); });
  }
  checks.forEach((c) => c.addEventListener("change",render));
  root.querySelector("[data-compare-differences]").addEventListener("change",render);
  show.addEventListener("click",()=> { if(selected().length < 2) return; result.hidden = false; result.focus(); });
  root.querySelector("[data-pack-sort]").addEventListener("change",(e)=> { const field = e.target.value, box = root.querySelector("[data-packs]"); const ordered = [...packs].sort((a,b)=>field === "unit" ? unitPrice(a.price,a.count)-unitPrice(b.price,b.count) : a.price-b.price); ordered.forEach((p)=>box.append(root.querySelector(`[data-pack="${p.id}"]`))); });
  render();
}
