// Illustrative body measurements only; these are not Famme sizing specifications.
export const guideSizes = [
  { size: "XS", waist: 60, hips: 84 }, { size: "S", waist: 66, hips: 90 },
  { size: "M", waist: 72, hips: 96 }, { size: "L", waist: 78, hips: 102 },
  { size: "XL", waist: 84, hips: 108 },
];
export function measurement(value, unit = "cm", locale = "nb") {
  return new Intl.NumberFormat(locale === "nb" ? "nb-NO" : "en", { maximumFractionDigits: unit === "inch" ? 1 : 0 }).format(unit === "inch" ? value / 2.54 : value);
}
export function installFashionGuides(products, nb) {
  const t=(a,b)=>nb?a:b, el=(tag,text)=>{ const n=document.createElement(tag); if(text != null)n.textContent=text; return n; };
  const dialog=el("dialog"); dialog.className="ux-size-guide"; dialog.setAttribute("aria-label",t("Illustrerende størrelsesguide","Illustrative size guide")); document.body.append(dialog);
  let opener, product, selected, unit="cm";
  function render() {
    dialog.replaceChildren(); const header=el("div"), close=el("button",t("Lukk","Close")); close.type="button"; close.addEventListener("click",()=>dialog.close());
    header.className="ux-guide-header"; header.append(el("h2",product.title),close); dialog.append(header,el("p",t("Fiktive kroppsmål for design-test. Ikke Famme-mål eller råd om virkelig passform.","Fictional body measurements for a design test. Not Famme measurements or real fit advice.")));
    const units=el("div"), caption=t("Kroppsmål","Body measurements"); units.className="ux-guide-units";
    for(const [id,label] of [["cm","cm"],["inch",t("Tommer","Inches")]]) { const b=el("button",label); b.type="button"; b.setAttribute("aria-pressed",String(unit===id)); b.addEventListener("click",()=>{ unit=id; render(); dialog.querySelector(`[data-unit="${id}"]`).focus(); }); b.dataset.unit=id; units.append(b); } dialog.append(units);
    const table=el("table"), head=el("thead"), tr=el("tr"); table.append(el("caption",`${caption} · ${unit === 'inch' ? t('tommer','inches') : 'cm'}`));
    for(const label of [t("Størrelse","Size"),t("Midje","Waist"),t("Hofte","Hips")]) { const th=el("th",label);th.scope="col";tr.append(th); } head.append(tr);table.append(head);const body=el("tbody");
    guideSizes.filter(row=>product.sizes.includes(row.size)).forEach(row=>{ const tr=el("tr"), th=el("th",row.size+(selected===row.size?t(" · valgt"," · selected"):"")); th.scope="row";if(selected===row.size)tr.className="selected"; tr.append(th,el("td",measurement(row.waist,unit,nb?'nb':'en')),el("td",measurement(row.hips,unit,nb?'nb':'en'))); body.append(tr); }); table.append(body);dialog.append(table);
    dialog.append(el("h3",t("Slik tar du målene","How to measure")),el("p",t("Midje: mål rundt det smaleste punktet uten å stramme målebåndet. Hofte: mål rundt det bredeste punktet. Tallene i denne laben er eksempler, ikke produktets faktiske dimensjoner.","Waist: measure around the narrowest point without pulling the tape tight. Hips: measure around the widest point. These lab numbers are examples, not actual product dimensions.")),el("p",t("Passform og stretch må beskrives per produkt. Modellenes mål er ikke kjent og er derfor ikke oppdiktet.","Fit and stretch must be described per product. Model measurements are unknown and therefore not invented.")));
    const link=el("a",t("Lær om størrelse og passform ↗","Learn about sizing and fit ↗"));link.href="/ux/size-guide/"+(nb?'':'?lang=en');dialog.append(link);
  }
  document.addEventListener("click",(event)=>{ const button=event.target.closest('[data-size-guide]');if(!button)return;product=products.find(p=>p.handle===button.dataset.sizeGuide);if(!product)return;opener=button;selected=button.closest('form')?.querySelector('[name=size]:checked')?.value;unit="cm";render();dialog.showModal(); });
  dialog.addEventListener('close',()=>opener?.focus());
}
