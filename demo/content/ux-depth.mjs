// Site-specific implementation decisions and regression tasks, not copied research.
export const topicDepth = {
  navigation: {
    challenge: ["En kunde som kjenner varetypen bør slippe å åpne flere mellomledd for å se varer.", "A shopper who knows the product type should not need several intermediate pages to see products."],
    when: ["Essential går rett til noen få produkter; Famme bruker kolleksjoner; Index trenger filtrering. Velg etter sortimentets størrelse og kjøpsoppgaven.", "Essential goes directly to a few products; Famme uses collections; Index needs filters. Choose by assortment size and shopping task."],
    extra: [["Åpne Essential på mobil: alle produktvalg skal finnes uten en kategori-popup.", "Open Essential on mobile: all product choices should be available without a category popup."], ["Åpne Famme fra en direkte kolleksjonslenke: hjem og andre kolleksjoner er fortsatt tilgjengelige.", "Open Famme from a direct collection link: home and other collections remain available."]],
  },
  search: {
    challenge: ["Null treff betyr ikke alltid at butikken mangler varen; søk og filtre kan kollidere.", "Zero results does not always mean a missing product; query and filters can conflict."],
    when: ["Samlingens søk gjelder denne samlingen. Hjelpesøk og søkeforslag vises i Discovery-laben; ikke lov globalt søk på en samlingsside.", "Collection search applies to that collection. Help search and suggestions live in Discovery; do not promise global search on a collection page."],
    extra: [["Kombiner et søk med et fargefilter som ikke matcher. Fjern bare søket: fargen skal stå igjen.", "Combine a query with a nonmatching color filter. Clear only search: preserve the color."], ["Søk med store bokstaver og norske tegn i testkatalogen; normalisering skal ikke endre den synlige teksten.", "Search the fixture with uppercase and Norwegian characters; normalization must not change the visible query."]],
  },
  filters: {
    challenge: ["Blå i størrelse M må finnes som én variant, ikke som blå S og grønn M.", "Blue in size M must exist as one variant, not as blue S plus green M."],
    when: ["Filtertyper leses fra den aktuelle katalogen. Når data mangler, skal du ikke legge til et dekorativt filter uten effekt.", "Facet types come from the current catalog. Missing data should not produce a decorative filter with no effect."],
    extra: [["Velg to farger i samme gruppe: begge fargene kan matche. Størrelse i en annen gruppe må fortsatt matche samme variant.", "Choose two colors in one group: either can match. Size in another group must still match the same variant."], ["Fjern én aktiv filterbrikke: øvrige valg og sortering skal beholdes.", "Remove one applied-filter chip: retain other choices and sorting."]],
  },
  "mobile-filters": {
    challenge: ["Et mobilt filterpanel bør tillate flere valg før resultatlisten byttes.", "A mobile panel should allow several choices before replacing the results."],
    when: ["Mobil bruker utkast og Vis produkter; desktop bruker umiddelbare endringer. De samme dataene og kontrollene brukes i begge.", "Mobile uses a draft and Show products; desktop applies immediately. Both use the same data and controls."],
    extra: [["Endre filtre og trykk Escape: utkastet forkastes, URL beholdes og fokus går tilbake til filterknappen.", "Change filters and press Escape: discard draft, retain URL and return focus to the filter control."], ["Sett fra-pris høyere enn til-pris: Vis produkter skal beholde panelet og vise en konkret feil.", "Set minimum above maximum: Show products must keep the panel open with a specific error."]],
  },
  "product-lists": {
    challenge: ["Produktkortet må gi et sammenlignbart valg før kunden åpner detaljsiden.", "A product card should support comparison before the detail page is opened."],
    when: ["Index gir filterbare data; Trade prioriterer antall per variant; Famme viser bilder og farger. Et teknisk sortiment kan i tillegg bruke Comparison-laben.", "Index supplies filterable data; Trade prioritizes quantities by variant; Famme shows imagery and colors. Technical assortments can additionally use Comparison."],
    extra: [["Sorter filtrerte produkter etter pris: kortprisen skal gjelde en variant som faktisk matcher filteret.", "Sort filtered products by price: the displayed price must belong to a variant matching the filter."], ["Bytt liste/rutenett: søk, produktutvalg og valgte filtre skal ikke endres.", "Switch list/grid: query, membership and filters must stay unchanged."]],
  },
  images: {
    challenge: ["Kunden trenger synlige innganger til andre vinkler, også uten hover.", "Shoppers need visible paths to other views, including without hover."],
    when: ["Fotografi hjelper når utseendet avgjør valget. En illustrasjon av et digitalt testprodukt er tydelig noe annet enn et produktfoto av en fysisk vare.", "Photography helps where appearance matters. An illustration of a digital fixture is different from a photograph of a physical item."],
    extra: [["Bruk tastaturet på Famme bilde 2: hovedbildet og aktiv miniatyr skal endres samtidig.", "Use the keyboard on Famme image 2: main image and active thumbnail change together."], ["Bytt produktfarge etter å ha sett en annen vinkel: hovedbildet skal følge den valgte fargen.", "Change product color after viewing another angle: the main image follows the selected color."]],
  },
  variants: {
    challenge: ["En synlig farge og størrelse må gi riktig pris, bilde og lagerstatus for den samme varianten.", "A visible color and size must map to price, image and stock for that same variant."],
    when: ["Famme bruker farge og størrelsesknapper; Trade viser flere mengdefelt; små støtteprodukter kan bruke en enkel variantvelger.", "Famme uses color and size buttons; Trade has multiple quantity fields; small support products can use a simple selector."],
    extra: [["Velg svart L og bytt til brun på Softy: L skal tømmes hvis den brune varianten er utsolgt.", "Choose black L and switch to brown on Softy: clear L when brown L is sold out."], ["Åpne hurtigkjøp fra et filtrert kort: farge og størrelse skal følge varianten som kortet matchet.", "Open quick-add from a filtered card: color and size follow the card’s matching variant."]],
  },
  stock: {
    challenge: ["Utsolgt, restordre og ukjent lager er forskjellige tilstander og skal ikke gi samme kjøpsløfte.", "Sold out, backorder and unknown availability are distinct states and must not make the same purchase promise."],
    when: ["Bruk restordre bare når virksomheten kan oppfylle den. Made-to-order trenger produksjonstid; et transportestimat alene er utilstrekkelig.", "Offer backorder only when the business can fulfill it. Made-to-order needs production lead time; a transport estimate alone is insufficient."],
    extra: [["Softy svart XL skal være merket simulert restordre og ikke komme med i Kun tilgjengelige varianter.", "Softy black XL is labeled simulated backorder and excluded by Available variants only."], ["En varsling om tilbake på lager krever eget samtykke; den skal ikke samtidig melde kunden på nyhetsbrev.", "A back-in-stock request needs separate consent; it must not also subscribe the shopper to newsletters."]],
  },
  cart: {
    challenge: ["Kurven må reagere med riktig total og fortsatt gi en vei tilbake etter fjerning.", "The cart must update its total and provide recovery after removal."],
    when: ["Drawer er godt egnet for hurtigkjøp; en full kurvside gir rom for gjennomgang. Testkurven er isolert fra den ekte ReAI-kurven.", "A drawer suits quick-add; a full cart page provides space for review. Fixture carts are isolated from the real ReAI cart."],
    extra: [["Endre samme vare raskt flere ganger: siste antall og total skal vinne, uten å sende flere katalogforespørsler.", "Change one line rapidly: the final quantity and total win without repeat catalog requests."], ["Sett antall til 0 og angre: riktig variant, antall og tastaturfokus skal gjenopprettes.", "Set quantity to zero then undo: restore the right variant, quantity and keyboard focus."]],
  },
  costs: {
    challenge: ["Varepris og hele kjøpets pris er ikke alltid det samme.", "Item price and the full purchase cost are not always the same."],
    when: ["Vis fraktberegningens forutsetninger. Laben bruker 49 kr; de digitale støtteproduktene oppretter ingen fysisk forsendelse.", "Show assumptions behind shipping costs. The lab uses 49 kr; digital support products create no physical shipment."],
    extra: [["Endre antall til 3: sending skal gi 349 kr og henting 300 kr i laben.", "Change quantity to 3: shipping totals 349 kr and pickup 300 kr in the lab."], ["Se gavekortets forklaring: manuell innløsning skal være tydelig før ekte checkout åpnes.", "Read gift-card details: manual redemption must be clear before opening real checkout."]],
  },
  delivery: {
    challenge: ["Henting er et leveringsvalg med egne krav, ikke en vanlig adresse som tilfeldigvis har gratis frakt.", "Pickup is a fulfillment choice with its own requirements, not an ordinary address with free shipping."],
    when: ["Skjul adressens krav ved henting, behold skrevet adresse ved retur til sending og vis hentested separat.", "Remove address requirements for pickup, preserve typed address on return to shipping and show pickup location separately."],
    extra: [["Skriv adresse, bytt til henting, gå til gjennomgang og tilbake til sending: alle adressefelt skal beholdes.", "Enter an address, switch to pickup, review then return to shipping: retain all address fields."], ["En hentebekreftelse skal vise hentested og dato, ikke gjenta den skjulte sendingsadressen.", "A pickup confirmation shows location and date, not the hidden shipping address."]],
  },
  "guest-checkout": {
    challenge: ["Kjøperen bør forstå om kontoen er nødvendig før skjemaet fylles ut.", "The shopper should know whether an account is needed before completing the form."],
    when: ["Laben krever ingen innlogging. En B2B-faktura krever egne opplysninger og autorisasjon i den ekte ReAI-konfigurasjonen.", "The lab requires no login. A B2B invoice needs separate information and authorization in actual ReAI configuration."],
    extra: [["Gjennomfør den simulerte privatflyten uten bedriftsvalg: ingen organisasjonsnummer eller fakturavalg skal vises.", "Complete the simulated consumer flow without business: no organization number or invoice option appears."], ["Aktiver bedrift og la organisasjonsnummer være tomt: feil skal gjelde akkurat det feltet.", "Enable business and leave organization number empty: the error concerns that field specifically."]],
  },
  payment: {
    challenge: ["En retur fra en betalingsside er ikke bevis på at betalingen er gjennomført.", "Returning from a payment page is not evidence of payment completion."],
    when: ["ReAI og betalingsleverandøren eier betalingsstatus. Laben gjør det mulig å teste UI-utfall uten å betale eller opprette ordre.", "ReAI and the payment provider own payment state. The lab tests UI outcomes without payment or order creation."],
    extra: [["Simuler avventer: bekreftelsen skal be om statusavklaring og aldri si betalt.", "Simulate pending: confirmation requests status verification and never says paid."], ["Simuler ubetalt B2B-faktura: kjøpsbekreftelse er ikke en betalingskvittering eller en sendt EHF-faktura.", "Simulate an unpaid B2B invoice: order confirmation is not a payment receipt or a dispatched EHF invoice."]],
  },
  errors: {
    challenge: ["Et generelt feilbanner er utilstrekkelig hvis kunden ikke finner feltet som må rettes.", "A generic error banner is insufficient when the shopper cannot find the field to fix."],
    when: ["Feltmeldinger beskriver hva som må rettes. En samlet feiloversikt lar tastaturbrukeren flytte direkte til feltet; kundens andre opplysninger beholdes.", "Field messages describe what needs correction. An error summary lets keyboard users move directly to the field; other input is retained."],
    extra: [["Send labskjema med feil e-post: feillenken skal fokusere e-postfeltet uten å slette navn.", "Submit the lab with an invalid email: the error link focuses email without erasing the name."], ["Simuler betalingsfeil, endre antall og prøv på nytt: gjennomgang og total skal bruke det nye antallet.", "Simulate payment failure, edit quantity and retry: review and total use the new quantity."]],
  },
  "after-purchase": {
    challenge: ["Status og neste steg må være forståelige før kunden inviteres videre.", "Status and next steps must be understood before inviting the shopper onward."],
    when: ["Betalt, avventer og faktura får ulike meldinger. Inspirasjon ligger etter bekreftelsen; frivillig nyhetsbrev har eget samtykke.", "Paid, pending and invoice get distinct messages. Inspiration follows confirmation; optional newsletters need separate consent."],
    extra: [["Bekreft henting i laben: total, mottaker, leveringsvalg og simulert ordre-ID skal være synlige sammen.", "Confirm pickup in the lab: total, recipient, fulfillment and simulated order ID appear together."], ["Trykk Prøv igjen: personopplysninger og betalingsutfall nullstilles; den ekte kurven skal ikke endres.", "Press Try again: reset contact data and outcome; do not modify the real cart."]],
  },
};
