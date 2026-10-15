import { documentHtml, escapeHtml, language, money } from "./storefront.mjs";

const h = escapeHtml;

/** @param {any} context @param {import("../../packages/reai-site-client/site-api.d.ts").components["schemas"]["SiteCheckoutDetailsDto"] | null} [checkout] */
export function renderMerchantCheckout(context, checkout = null) {
  const nb = language(context.locale) === "nb";
  const title = nb ? "Merchant checkout · ReAI" : "Merchant checkout · ReAI";
  const body = checkout
    ? `<section class="shell inner merchant-checkout" data-merchant-checkout data-checkout-id="${h(checkout.id)}" data-revision="${Number(checkout.revision) || 0}">
        <a class="breadcrumb" href="/cart/">← ${nb ? "Handlekurv" : "Cart"}</a>
        <span class="eyebrow">${nb ? "CHECKOUT PÅ MERCHANT-DOMENET" : "MERCHANT-DOMAIN CHECKOUT"}</span>
        <h1>${nb ? "Du er fortsatt på nettbutikk.reai.no." : "You are still on nettbutikk.reai.no."}</h1>
        <p class="lead">${nb ? "Denne siden viser merchant checkout-mønsteret: ReAI eier pris, lager, levering og betaling, mens butikken beholder checkout-skjermen lenger." : "This page demonstrates merchant checkout: ReAI owns price, stock, delivery and payment, while the store keeps the shopper on its own checkout screen longer."}</p>
        <div class="merchant-checkout-layout">
          <form data-merchant-form>
            <h2>${nb ? "Kontakt" : "Contact"}</h2>
            <label>${nb ? "Navn" : "Name"}<input name="name" autocomplete="name" value="${h(checkout.customer?.name || "")}" required></label>
            <label>${nb ? "E-post" : "Email"}<input name="email" type="email" autocomplete="email" value="${h(checkout.customer?.email || "")}" required></label>
            <label>${nb ? "Telefon" : "Phone"}<input name="phone" autocomplete="tel" value="${h(checkout.customer?.phone || "")}"></label>
            <h2>${nb ? "Levering" : "Fulfillment"}</h2>
            <div data-merchant-delivery><p>${nb ? "Leveringsvalg lastes når kontaktinformasjonen er gyldig." : "Delivery options load after the contact details are valid."}</p></div>
            <p class="merchant-error" data-merchant-error role="alert"></p>
            <button class="button" type="submit">${nb ? "Lagre kontakt og levering" : "Save contact and fulfillment"}</button>
          </form>
          <aside class="merchant-summary">
            <h2>${nb ? "Ordresammendrag" : "Order summary"}</h2>
            <div data-merchant-lines>${(checkout.lines || []).map((line) => `<p><b>${h(line.title)}</b> × ${Number(line.quantity)}<br><span>${h((line.options || []).map((o) => o.value).join(" / "))}</span><strong>${h(money(line.gross, { currency: checkout.currency, locale: checkout.locale }))}</strong></p>`).join("")}</div>
            <dl><dt>${nb ? "Delsum" : "Subtotal"}</dt><dd>${h(money(checkout.subtotal, { currency: checkout.currency, locale: checkout.locale }))}</dd><dt>${nb ? "Frakt" : "Shipping"}</dt><dd data-merchant-shipping>${checkout.shippingGross == null ? "—" : h(money(checkout.shippingGross, { currency: checkout.currency, locale: checkout.locale }))}</dd><dt><b>${nb ? "Totalt" : "Total"}</b></dt><dd data-merchant-total><b>${h(money(checkout.total, { currency: checkout.currency, locale: checkout.locale }))}</b></dd></dl>
            <button class="button" type="button" data-merchant-prepare>${nb ? "Gå til betaling" : "Continue to payment"} ↗</button>
            <p class="fineprint">${nb ? "Betalingsopplysninger behandles på ReAI/Adyen etter at du har fullført denne merchant-siden. En retur hit er ikke betalingsbekreftelse." : "Payment details are handled by ReAI/Adyen after this merchant page is complete. Returning here is not payment confirmation."}</p>
          </aside>
        </div>
      </section>`
    : `<section class="shell inner merchant-checkout-intro"><span class="eyebrow">MERCHANT CHECKOUT</span><h1>${nb ? "Checkout som blir på butikkens domene." : "Checkout that stays on the store domain."}</h1><p class="lead">${nb ? "Legg et live testprodukt i kurven og velg «Merchant checkout» for å prøve en checkout-side som ligner på New Movements." : "Add a live test product to the cart and choose “Merchant checkout” to try a checkout page similar to New Movements."}</p><a class="button" href="/products/test-betaling/">${nb ? "Velg testprodukt" : "Choose test product"} ↗</a><p><a href="/learn/merchant-checkout/">${nb ? "Les hvordan mønsteret virker" : "Read how the pattern works"} ↗</a></p></section>`;
  return documentHtml(title, body, { ...context, design: "merchant-checkout" });
}
