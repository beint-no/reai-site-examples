import { documentHtml, language, escapeHtml } from "./storefront.mjs";

export function renderFulfillmentScenario(context) {
  const nb = language(context.locale) === "nb";
  return documentHtml(
    nb ? "Pickup og bundle-lab" : "Pickup and bundle lab",
    `<section class="shell inner scenario-page fulfillment-scenario" data-fulfillment-lab>
      <a class="breadcrumb" href="/">← ${nb ? "Til ReAI showcase" : "Back to ReAI showcase"}</a>
      <div class="scenario-banner"><b>${nb ? "UI-LABORATORIUM · SIMULERTE DATA" : "UI LAB · SIMULATED DATA"}</b><p>${nb ? "Denne laben oppretter ingen ordre, reserverer ikke lager og bestiller ikke frakt." : "This lab creates no order, reserves no stock and books no shipping."}</p></div>
      <span class="eyebrow">${nb ? "FYSISK HANDEL" : "PHYSICAL COMMERCE"}</span>
      <h1>${nb ? "Pakke + pickup." : "Bundle + pickup."}</h1>
      <p class="lead">${nb ? "Test hvordan en fysisk pakke kan velges, hvordan komponentlager begrenser kapasitet, og hvordan sending og hent selv bør presenteres." : "Test how a physical bundle can be selected, how component stock limits capacity, and how shipping and pickup should be presented."}</p>
      <div class="fulfillment-grid">
        <article><h2>${nb ? "ReAI Demo kit" : "ReAI Demo kit"}</h2><p>${nb ? "1 × kopp + 1 × kort + 1 × pose" : "1 × mug + 1 × card + 1 × pouch"}</p><strong>349 kr</strong><label>${nb ? "Antall" : "Quantity"}<input type="number" min="1" max="4" value="1" data-bundle-quantity></label><p class="availability-status" data-bundle-status>${nb ? "Kapasitet: 4 pakker" : "Capacity: 4 bundles"}</p><button class="button" type="button" data-bundle-add>${nb ? "Legg i testkurv" : "Add to test cart"}</button></article>
        <article><h2>${nb ? "Leveringsvalg" : "Fulfillment options"}</h2><label class="fulfillment-option"><input type="radio" name="fulfillment" value="shipping" checked><span><b>${nb ? "Send til adresse" : "Ship to address"}</b><small>79 kr · ${nb ? "Simulert 2–4 virkedager" : "Simulated 2–4 business days"}</small></span></label><label class="fulfillment-option"><input type="radio" name="fulfillment" value="pickup"><span><b>${nb ? "Hent hos ReAI demo" : "Collect at ReAI demo"}</b><small>0 kr · ${nb ? "Testgata 1, Oslo" : "Testgata 1, Oslo"}</small></span></label><div data-pickup-details hidden><label>${nb ? "Velg hentested" : "Choose pickup location"}<select><option>ReAI demo · Testgata 1</option><option>ReAI demo · Storgata 4</option></select></label><p>${nb ? "Pickup krever fysisk vare og tydelig hentetekst i den ekte Site-konfigurasjonen." : "Pickup requires a physical item and clear collection instructions in the real Site configuration."}</p></div></article>
      </div><p data-fulfillment-message role="status"></p><a class="under-link" href="/learn/bundles-and-pickup/">${nb ? "Les hvordan dette kobles til Site API og checkout" : "Read how this connects to the Site API and checkout"} ↗</a>
    </section><script type="module" src="/assets/fulfillment-scenario.js"></script>`,
    { ...context, design: "fulfillment-scenario", scenario: true },
  );
}
