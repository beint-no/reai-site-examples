import { searchDiscovery, discoverySuggestions } from "./discovery-model.js";
const root = document.querySelector("[data-discovery-lab]");
if (root) {
  const nb = document.body.dataset.locale === "nb", t = (a, b) => nb ? a : b;
  const field = root.querySelector("[name=q]"), list = root.querySelector("[role=listbox]");
  let typed = "", active = -1, suggestions = [];
  const el = (tag, text) => { const n = document.createElement(tag); if (text != null) n.textContent = text; return n; };
  function close() { list.hidden = true; field.setAttribute("aria-expanded", "false"); field.removeAttribute("aria-activedescendant"); active = -1; }
  function show() {
    typed = field.value; suggestions = discoverySuggestions(typed, nb ? "nb" : "en"); active = -1;
    field.removeAttribute("aria-activedescendant"); list.replaceChildren();
    suggestions.forEach((s, i) => {
      const option = el("li", s); option.id = "suggestion-" + i; option.setAttribute("role", "option"); option.setAttribute("aria-selected", "false");
      option.addEventListener("mousedown", (e) => e.preventDefault());
      option.addEventListener("click", () => { field.value = s; close(); submit(); field.focus(); });
      list.append(option);
    });
    list.hidden = !suggestions.length; field.setAttribute("aria-expanded", String(!!suggestions.length));
  }
  function render(query) {
    const result = searchDiscovery(query), box = root.querySelector("[data-discovery-results]"), help = root.querySelector("[data-discovery-help]");
    box.replaceChildren(); help.replaceChildren();
    root.querySelector("[data-discovery-count]").textContent = `${result.products.length} ${t("produkter", result.products.length === 1 ? "product" : "products")} · ${result.help.length} ${t("hjelpesvar", result.help.length === 1 ? "help answer" : "help answers")}${query ? ` · “${query}”` : ""}`;
    document.querySelectorAll(".language").forEach((link) => { const target = new URL(link.href); if(query) target.searchParams.set("q",query); else target.searchParams.delete("q"); link.href = target.pathname + target.search; });
    result.products.forEach((p) => {
      const row = el("article"), art = el("span", p.title.slice(0, 1)); art.className = "ux-search-art"; art.setAttribute("aria-hidden", "true");
      row.append(art, el("h2", p.title), el("strong", p.price + " kr"), el("p", nb ? p.type : p.type === "Termokopp" ? "Travel mug" : "Water bottle"));
      row.append(el("small", p.variants.map((v) => `${v.sku} · ${v.values[nb ? 1 : 0]} · ${v.values[2]} ml`).join(" / ")));
      box.append(row);
    });
    result.help.forEach((item) => {
      const row = el("article"), a = el("a", item.title[nb ? 0 : 1] + " ↗"); a.href = item.href + (nb ? "" : "?lang=en");
      row.append(a, el("p", item.body[nb ? 0 : 1])); help.append(row);
    });
    root.querySelector("[data-discovery-empty]").hidden = !!(result.products.length || result.help.length);
  }
  function submit(mode = "push") {
    const q = field.value.trim().slice(0,120), u = new URL(location.href); field.value = q;
    if (q) u.searchParams.set("q", q); else u.searchParams.delete("q");
    if (u.href !== location.href) history[mode === "push" ? "pushState" : "replaceState"](null, "", u);
    close(); render(q);
  }
  field.addEventListener("input", show);
  field.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { if(!list.hidden) { event.preventDefault(); field.value = typed; close(); } return; }
    if (!["ArrowDown", "ArrowUp"].includes(event.key) || !suggestions.length) return;
    event.preventDefault(); if (list.hidden) show();
    active = event.key === "ArrowDown" ? (active + 1) % suggestions.length : (active <= 0 ? suggestions.length - 1 : active - 1);
    field.value = suggestions[active]; field.setAttribute("aria-activedescendant", "suggestion-" + active);
    [...list.children].forEach((option, i) => option.setAttribute("aria-selected", String(i === active)));
  });
  field.addEventListener("blur", () => close());
  root.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); submit(); });
  root.querySelectorAll("[data-discovery-example]").forEach((b) => b.addEventListener("click", () => { field.value = b.dataset.discoveryExample; submit(); field.focus(); }));
  root.querySelector("[data-discovery-clear]").addEventListener("click", () => { field.value = ""; submit(); field.focus(); });
  window.addEventListener("popstate", () => { field.value = new URL(location.href).searchParams.get("q") || ""; close(); render(field.value); });
  field.value = new URL(location.href).searchParams.get("q") || ""; submit("replace");
}
