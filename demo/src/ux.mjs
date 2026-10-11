import { uxTopics, designTopics } from "../content/ux.mjs";
const h = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const pick = (c, v) => v[String(c.locale).startsWith("en") ? 1 : 0];
const labels = {
  discover: ["Finne", "Discover"],
  evaluate: ["Vurdere", "Evaluate"],
  buy: ["Kjøpe", "Buy"],
  retain: ["Etter kjøpet", "After purchase"],
};
const withLang = (url, c) => {
  const u = new URL(url, "https://nettbutikk.reai.no");
  if (String(c.locale).startsWith("en"))
    u.searchParams.set(
      url.startsWith("/designs/starter") ? "locale" : "lang",
      "en",
    );
  return u.pathname + u.search + u.hash;
};
export function uxTitle(path, c) {
  const topic = uxTopics.find((t) => path === "/ux/" + t.slug);
  return topic
    ? pick(c, topic.title)
    : path === "/ux/lab/checkout"
      ? "Checkout lab"
      : "E-commerce UX";
}
export function designLearning(slug, c) {
  const topics = (designTopics[slug] || []).map((id) =>
    uxTopics.find((t) => t.slug === id),
  );
  return `<section class="ux-design-notes"><div><b>${pick(c, ["Lær av dette designet", "Learn from this design"])}</b><a href="${withLang("/ux/", c)}">${pick(c, ["Alle konsepter og testoppgaver", "All concepts and test tasks"])} ↗</a></div><nav aria-label="${pick(c, ["UX-konsepter", "UX concepts"])}">${topics.map((t) => `<a href="${withLang("/ux/" + t.slug + "/", c)}">${h(pick(c, t.title))}</a>`).join("")}</nav></section>`;
}
export function renderUxBody(path, c) {
  const t = uxTopics.find((t) => path === "/ux/" + t.slug);
  if (path === "/ux/lab/checkout") return checkoutLab(c);
  if (t)
    return `<section class="shell inner ux-lesson"><nav class="ux-breadcrumb" aria-label="${pick(c, ["Brødsmulesti", "Breadcrumb"])}"><a href="${withLang("/ux/", c)}">${pick(c, ["UX-læringssenter", "UX learning center"])}</a><span>/ ${h(pick(c, labels[t.stage]))}</span></nav><span class="eyebrow">${pick(c, ["KONSEPT", "CONCEPT"])} ${String(uxTopics.indexOf(t) + 1).padStart(2, "0")} / 15</span><h1>${h(pick(c, t.title))}</h1><p class="lead">${h(pick(c, t.principle))}</p><p class="ux-source">${pick(c, ["Utgangspunkt: offentlig forskning fra", "Starting point: public research from"])} <a href="${t.source[1]}">Baymard · ${h(t.source[0])} ↗</a></p><div class="ux-lesson-grid"><div><h2>${pick(c, ["Prøv mønsteret", "Try the pattern"])}</h2><div class="ux-example-links">${t.examples.map(([label, url]) => `<a class="under-link" href="${withLang(url, c)}">${h(label)} ↗</a>`).join("")}</div><ol class="ux-tasks">${t.cases.map((step, i) => `<li><span>0${i + 1}</span><p>${h(pick(c, step))}</p></li>`).join("")}</ol></div><aside><h2>${pick(c, ["Slik bruker du ReAI", "How to use ReAI"])}</h2><p>${h(pick(c, t.data))}</p><a href="${withLang("/features/", c)}">${pick(c, ["Plattformens byggeklosser", "Platform primitives"])} ↗</a><h3>${pick(c, ["Hva eksemplet faktisk viser", "What the example actually shows"])}</h3><p>${h(pick(c, t.boundary))}</p></aside></div><div class="ux-next"><p>${pick(c, ["Vår tolkning og implementering. Dette er ikke en Baymard-audit eller sertifisering. Testoppgavene er skrevet for disse ReAI-eksemplene.", "Our interpretation and implementation. This is not a Baymard audit or certification. The acceptance tasks are written for these ReAI examples."])}</p><a href="${withLang("/ux/" + uxTopics[(uxTopics.indexOf(t) + 1) % uxTopics.length].slug + "/", c)}">${pick(c, ["Neste konsept", "Next concept"])} →</a></div></section>`;
  return `<section class="shell inner ux-hub"><span class="eyebrow">REAI / E-COMMERCE UX</span><h1>${pick(c, ["Fra forskning<br>til handleopplevelse.", "From research<br>to shopping experience."])}</h1><p class="lead">${pick(c, ["Lær 15 praktiske UX-konsepter. Prøv dem i 10 butikkdesign, og følg konkrete testoppgaver fra produktfunn til bekreftelse.", "Learn 15 practical UX concepts. Try them in 10 storefront designs and follow concrete test tasks from discovery to confirmation."])}</p><div class="ux-hub-actions"><a class="button" href="${withLang("/ux/lab/checkout/", c)}">${pick(c, ["Prøv hele checkout-laben", "Try the complete checkout lab"])} ↗</a><a class="under-link" href="#coverage">${pick(c, ["Finn riktig butikkdesign", "Find the right storefront design"])} ↓</a></div><p class="ux-source">${pick(c, ["Basert på utvalgt offentlig forskning fra Baymard. Forklaringene og testene er vår egen anvendelse i ReAI. Ingen premium-innhold, sertifisering eller løfte om økt konvertering.", "Based on selected public Baymard research. Explanations and tests are our own application in ReAI. No premium content, certification or promise of increased conversion."])}</p><nav class="ux-stage-nav" aria-label="${pick(c, ["Kjøpsreisen", "Shopping journey"])}">${Object.entries(
    labels,
  )
    .map(([key, label]) => `<a href="#${key}">${pick(c, label)}</a>`)
    .join("")}</nav>${Object.entries(labels)
    .map(
      ([stage, label], i) =>
        `<section class="ux-stage" id="${stage}"><header><span>0${i + 1}</span><h2>${pick(c, label)}</h2><p>${pick(c, [["Gjør sortimentet lett å forstå.", "Gi kunden grunnlag for å velge.", "Fjern unødvendig arbeid og usikkerhet.", "Forklar status og neste steg."][i], ["Make the assortment easy to understand.", "Give shoppers the information to choose.", "Remove unnecessary effort and uncertainty.", "Explain status and the next step."][i]])}</p></header><div>${uxTopics
          .filter((t) => t.stage === stage)
          .map(
            (t) =>
              `<article><div><h3><a href="${withLang("/ux/" + t.slug + "/", c)}">${h(pick(c, t.title))} ↗</a></h3><p>${h(pick(c, t.principle))}</p></div><span>${t.examples.length} ${pick(c, ["eksempler", "examples"])} · 3 ${pick(c, ["testoppgaver", "test tasks"])}</span></article>`,
          )
          .join("")}</div></section>`,
    )
    .join(
      "",
    )}<section id="coverage" class="ux-coverage"><span class="eyebrow">10 DESIGNS / 45 ${pick(c, ["TESTOPPGAVER", "TEST TASKS"])}</span><h2>${pick(c, ["Samme plattform.<br>Forskjellige kjøpsoppgaver.", "One platform.<br>Different shopping tasks."])}</h2><p>${pick(c, ["Designene viser ulike mønstre der de passer. En liten gavekortbutikk trenger ikke et stort filtersystem. Lenker tar deg til konsepter og eksempler; de er ikke en poengsum eller påstand om full dekning.", "Designs demonstrate patterns where they fit. A small gift-card store does not need a large filter system. Links lead to concepts and examples; they are not a score or claim of exhaustive coverage."])}</p><div class="ux-coverage-rows">${Object.entries(
    designTopics,
  )
    .map(
      ([slug, ids]) =>
        `<article><a href="${withLang("/designs/" + slug + "/", c)}"><strong>${{ starter: "Everyday", collections: "Index" }[slug] || slug[0].toUpperCase() + slug.slice(1)} ↗</strong><small>${pick(c, slug === "famme" || slug === "lookbook" ? ["Isolerte motedata", "Isolated fashion data"] : ["Publisert ReAI-katalog", "Published ReAI catalog"])}</small></a><div>${ids
          .map((id) => {
            const t = uxTopics.find((t) => t.slug === id);
            return `<a href="${withLang("/ux/" + id + "/", c)}">${h(pick(c, t.title))}</a>`;
          })
          .join("")}</div></article>`,
    )
    .join(
      "",
    )}</div></section><section class="ux-boundaries"><h2>${pick(c, ["Hva som testes hvor", "What is tested where"])}</h2><dl><dt>${pick(c, ["Butikkdesignene", "Storefront designs"])}</dt><dd>${pick(c, ["Navigasjon, søk, filtre, variantvalg og separate nettleserkurver. Live-priser kommer fra Site API; Famme er tydelig fiktiv.", "Navigation, search, filters, variant choices and separate browser carts. Live prices come from the Site API; Famme is explicitly fictional."])}</dd><dt>Checkout lab</dt><dd>${pick(c, ["Fiktiv vare, frakt og betalingsutfall. Ingen API-mutasjoner, bestilling, e-post eller betaling. Bruk bare testinformasjon.", "Fictional product, shipping and payment outcomes. No API mutations, orders, emails or payments. Use test information only."])}</dd><dt>ReAI hosted checkout</dt><dd>${pick(c, ["Ekte regler for pris, rabatt, lager, frakt og betaling. Bruk kjøpssjekklisten for produksjon; denne UX-laben beviser ikke at betaling eller transportør virker.", "Real rules for prices, discounts, stock, shipping and payment. Use the purchase checklist for production; this UX lab does not prove payments or carriers work."])} <a href="${withLang("/learn/checkout-test/", c)}">${pick(c, ["Sjekkliste", "Checklist"])} ↗</a></dd></dl></section></section>`;
}
function checkoutLab(c) {
  const field = (name, nb, en, value, autocomplete = "off") =>
    `<div><label for="lab-${name}">${pick(c, [nb, en])}<input id="lab-${name}" name="${name}" value="${value}" ${["org", "postal"].includes(name) ? 'inputmode="numeric"' : ""} autocomplete="${autocomplete}" ${name === "email" ? 'type="email"' : 'type="text"'} aria-describedby="lab-error-${name}"></label><small id="lab-error-${name}" data-field-error="${name}"></small></div>`;
  return `<section class="shell inner ux-checkout"><a class="under-link" href="${withLang("/ux/", c)}">← ${pick(c, ["UX-læringssenter", "UX learning center"])}</a><span class="eyebrow">${pick(c, ["KUN SIMULERING", "SIMULATION ONLY"])}</span><h1>Checkout lab.</h1><p class="lead">${pick(c, ["Prøv levering, henting, bedrift og betalingsfeil uten å opprette en ordre. Bruk kun testinformasjon. Alt skjer i nettleseren og forsvinner ved omlasting.", "Try shipping, pickup, business orders and payment errors without creating an order. Use test information only. Everything stays in the browser and resets on reload."])}</p><div class="ux-lab-layout" data-checkout-lab><div><form data-lab-form novalidate><h2>${pick(c, ["1. Kontakt og levering", "1. Contact and delivery"])}</h2><p>${pick(c, ["Gjestecheckout · ingen konto kreves", "Guest checkout · no account required"])}</p><div class="ux-error-summary" role="alert" data-lab-errors tabindex="-1" hidden></div><div class="ux-fields">${field("name", "Navn", "Name", "Demo Kunde")}${field("email", "E-post", "Email", "demo@example.invalid")}</div><label class="ux-check"><input type="checkbox" name="business">${pick(c, ["Kjøp som bedrift", "Buy as a business"])}</label><div data-lab-business hidden>${field("org", "Organisasjonsnummer (9 sifre)", "Organization number (9 digits)", "123456789")}</div><fieldset class="ux-delivery"><legend>${pick(c, ["Leveringsmåte", "Fulfillment method"])}</legend><label><input type="radio" name="delivery" value="shipping" checked><span><b>${pick(c, ["Send til testadresse", "Ship to test address"])}</b><small>49 kr · ${pick(c, ["Eksempel: 2–4 virkedager", "Example: 2–4 business days"])}</small></span></label><label><input type="radio" name="delivery" value="pickup"><span><b>${pick(c, ["Hent hos eksempelbutikken", "Collect at the example store"])}</b><small>0 kr · ${pick(c, ["Testgata 1, Oslo. Eksempel: klar neste virkedag.", "Testgata 1, Oslo. Example: ready next business day."])}</small></span></label></fieldset><div data-lab-address class="ux-fields">${field("address", "Gateadresse", "Street address", "Testgata 1")}${field("postal", "Postnummer (4 sifre)", "Postal code (4 digits)", "0001")}${field("city", "Sted", "City", "Testbyen")}</div><h3>${pick(c, ["Antall testprodukter", "Test item quantity"])}</h3><label>${pick(c, ["Antall", "Quantity"])}<input id="lab-quantity" name="quantity" type="number" value="1" min="1" max="20" aria-describedby="lab-error-quantity"></label><small id="lab-error-quantity" data-field-error="quantity"></small><button class="button" type="submit">${pick(c, ["Gå til gjennomgang", "Continue to review"])} →</button></form><section data-lab-review tabindex="-1" hidden><h2>${pick(c, ["2. Gjennomgang og betaling", "2. Review and payment"])}</h2><p data-lab-review-text></p><button type="button" class="under-link" data-lab-edit>${pick(c, ["Endre kontakt eller levering", "Edit contact or delivery"])}</button><fieldset class="ux-delivery"><legend>${pick(c, ["Simulert betalingsutfall", "Simulated payment outcome"])}</legend><label><input type="radio" name="outcome" value="paid" checked>${pick(c, ["Betaling bekreftet", "Payment confirmed"])}</label><label><input type="radio" name="outcome" value="failed">${pick(c, ["Betaling mislyktes", "Payment failed"])}</label><label><input type="radio" name="outcome" value="pending">${pick(c, ["Betaling avventer", "Payment pending"])}</label><label data-lab-invoice hidden><input type="radio" name="outcome" value="invoice">${pick(c, ["Faktura · ubetalt ordre", "Invoice · unpaid order"])}</label></fieldset><p>${pick(c, ["Ekte betalingsmetoder velges i ReAI checkout. Disse knappene simulerer bare utfallet; ingen kort eller wallet behandles.", "Real payment methods are chosen in ReAI checkout. These controls only simulate the outcome; no card or wallet is processed."])}</p><button class="button" data-lab-pay type="button">${pick(c, ["Simuler betalingsutfallet", "Simulate payment outcome"])}</button><p role="alert" data-lab-payment-error></p></section><section data-lab-confirmation tabindex="-1" hidden><span class="eyebrow">${pick(c, ["SIMULERT BEKREFTELSE", "SIMULATED CONFIRMATION"])}</span><h2 data-lab-confirm-title></h2><p data-lab-confirm-text></p><p data-lab-confirm-details></p><p>${pick(c, ["Eksempelordre UX-001. Ingen ekte ordre, betaling eller e-post er opprettet.", "Example order UX-001. No real order, payment or email was created."])}</p><a class="under-link" href="${withLang("/designs/lookbook/", c)}">${pick(c, ["Utforsk et annet design", "Explore another design"])} ↗</a><button data-lab-reset type="button">${pick(c, ["Prøv igjen", "Try again"])}</button></section></div><aside class="ux-order-summary"><h2>${pick(c, ["Ordresammendrag", "Order summary"])}</h2><p>${pick(c, ["Fiktivt testprodukt", "Fictional test product"])} · 100 kr</p><dl><dt>${pick(c, ["Delsum", "Subtotal"])}</dt><dd data-lab-subtotal>100 kr</dd><dt>${pick(c, ["Frakt", "Shipping"])}</dt><dd data-lab-shipping>49 kr</dd><dt>${pick(c, ["Total inkl. avgifter", "Total including taxes"])}</dt><dd data-lab-total>149 kr</dd></dl><p>${pick(c, ["Fiktive priser i NOK. Ingen rabatt, provisjon eller andre gebyrer i dette scenarioet.", "Fictional NOK prices. No discounts, commissions or additional fees in this scenario."])}</p><details open><summary>${pick(c, ["Dette kan du kontrollere", "What to check"])}</summary><ul><li>${pick(c, ["Henting skjuler adressekrav", "Pickup hides address requirements"])}</li><li>${pick(c, ["Frakt → henting → frakt beholder adressen", "Shipping → pickup → shipping keeps the address"])}</li><li>${pick(c, ["Feltfeil beholder informasjon", "Field errors retain information"])}</li><li>${pick(c, ["Avventer er aldri merket betalt", "Pending is never labeled paid"])}</li></ul></details><nav aria-label="${pick(c, ["Relaterte konsepter", "Related concepts"])}">${["costs", "delivery", "guest-checkout", "payment", "errors", "after-purchase"].map((id) => `<a href="${withLang("/ux/" + id + "/", c)}">${h(pick(c, uxTopics.find((t) => t.slug === id).title))} ↗</a>`).join("")}</nav></aside></div><script type="module" src="/assets/checkout-lab.js"></script></section>`;
}
