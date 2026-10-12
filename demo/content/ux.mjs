// Original ReAI explanations and acceptance scenarios based on public research.
// No premium guidelines, copied benchmark screenshots, or certification claims.
import { additionalTopics, learningPaths } from "./ux-extension.mjs";
import { topicDepth } from "./ux-depth.mjs";
import { commerceTopics } from "./ux-commerce.mjs";
import { libraryTopics } from "./ux-library.mjs";
import { topicTitles, uxGroups, groupForTopic } from "./ux-groups.mjs";
export { learningPaths, uxGroups, groupForTopic };
const topic = (
  slug,
  stage,
  title,
  principle,
  source,
  examples,
  data,
  cases,
  boundary,
) => ({
  slug,
  stage,
  title,
  principle,
  source,
  examples,
  data,
  cases,
  boundary,
});
const baseTopics = [
  topic(
    "navigation",
    "discover",
    ["Riktig vei til produktene", "A direct route to products"],
    [
      "Små sortiment trenger ofte en direkte produktliste. Større sortiment kan ha en kategoriinngang som hjelper kunder å velge retning.",
      "Small catalogs often benefit from a direct product list. Larger catalogs can use category hubs to help customers choose a direction.",
    ],
    [
      "DTC category navigation",
      "https://baymard.com/research-articles/dtc-avoid-intermediary-category-pages",
    ],
    [
      ["Essential", "/designs/essential/"],
      ["Famme", "/designs/famme/#collections"],
      ["Index", "/designs/collections/"],
    ],
    [
      "Samlinger gir navngitte innganger. Medlemskap styres i ReAI; antall trinn og visuell struktur styres i butikken.",
      "Collections provide named entry points. ReAI controls membership; the storefront controls the number of steps and visual structure.",
    ],
    [
      [
        "Finn testbetaling uten å velge kategori først.",
        "Find the test payment without choosing a category first.",
      ],
      [
        "Åpne Softy og sjekk at alle viste varer tilhører den samlingen.",
        "Open Softy and check every displayed item belongs to that collection.",
      ],
      [
        "Åpne mobilmenyen med tastatur og følg en samlingslenke.",
        "Open the mobile menu with a keyboard and follow a collection link.",
      ],
    ],
    [
      "En stor kategoristruktur er ikke et mål i seg selv. Essential og Launch viser bevisst færre navigasjonstrinn.",
      "A large category tree is not a goal in itself. Essential and Launch intentionally use fewer navigation steps.",
    ],
  ),
  topic(
    "search",
    "discover",
    ["Søk som hjelper videre", "Search that helps you recover"],
    [
      "Et tomt søkeresultat bør gi relevante veier videre. Kunden trenger mulighet til å endre søket uten å starte hele besøket på nytt.",
      "An empty search result should offer relevant ways forward. Shoppers need to revise their search without restarting their visit.",
    ],
    [
      "Mobile search and navigation",
      "https://baymard.com/research-articles/mobile-ecommerce-search-and-navigation",
    ],
    [
      ["Everyday", "/designs/starter/collections/all"],
      ["Index", "/designs/collections/"],
      ["Famme", "/designs/famme/collections/all/"],
    ],
    [
      "Navn, beskrivelse, produkttype, egenskapsnavn og aliaser brukes i lokal katalogmatching. Søk er avgrenset til gjeldende samling.",
      "Names, descriptions, product types, attribute labels and aliases feed local catalog matching. Search is scoped to the current collection.",
    ],
    [
      [
        "Søk etter gavekort, og send søket med knappen eller Enter.",
        "Search for a gift card, submitting with the button or Enter.",
      ],
      [
        "Søk etter zzzzz. En forklaring og handlingene for å fjerne søk/filtre skal vises.",
        "Search for zzzzz. An explanation and actions to clear search/filters should appear.",
      ],
      [
        "Fjern bare søket: samling, sortering og andre filtre skal beholdes.",
        "Clear only the search: collection, sorting and other filters should remain.",
      ],
    ],
    [
      "Dette er katalogmatching, ikke en søkemotor med skrivefeilretting, rangering eller prediktiv autofullføring.",
      "This is catalog matching, not a search engine with typo correction, ranking or predictive autocomplete.",
    ],
  ),
  topic(
    "filters",
    "discover",
    ["Filtre som matcher én variant", "Filters that match one variant"],
    [
      "Vis aktive filtre og antall treff. Tillat flere valg innen samme filtergruppe, slik at for eksempel to farger kan passe samtidig.",
      "Show applied filters and result counts. Allow multiple choices within a filter group so, for example, either of two colors can match.",
    ],
    ["Ecommerce filtering", "https://baymard.com/blog/ecommerce-filter-ui"],
    [
      ["Index", "/designs/collections/"],
      ["Everyday", "/designs/starter/collections/all"],
      ["Famme", "/designs/famme/collections/all/"],
    ],
    [
      "ReAI leverer egenskaper, varianter og priser. Farge, størrelse, pris og lager må passe den samme varianten. OR innen en gruppe; AND mellom grupper.",
      "ReAI supplies attributes, variants and prices. Color, size, price and stock must match the same variant. OR within a group; AND between groups.",
    ],
    [
      [
        "Velg to farger. Produkter med én av fargene skal vises.",
        "Choose two colors. Products matching either color should appear.",
      ],
      [
        "I Famme: Softy, brun og L med kun tilgjengelige varianter skal ikke gi Softy Straight Leg.",
        "In Famme: Softy, brown and L with available variants only must not return Softy Straight Leg.",
      ],
      [
        "Fjern én filterbrikke og sjekk at resten av valgene beholdes.",
        "Remove one filter chip and check that the remaining choices are preserved.",
      ],
    ],
    [
      "Famme bruker lokale lagerdata. Index og Everyday kontrollerer publisert tilgjengelighet via Site API.",
      "Famme uses local stock data. Index and Everyday check published availability through the Site API.",
    ],
  ),
  topic(
    "mobile-filters",
    "discover",
    ["Velg flere filtre på mobil", "Choose several filters on mobile"],
    [
      "I et separat mobilfilter må kunden kunne gjøre flere valg og deretter bruke dem samlet, med en tydelig knapp som er lett å nå.",
      "A separate mobile filter interface should let shoppers make several selections and apply them together with a clear, easily reachable button.",
    ],
    ["Mobile interface controls", "https://baymard.com/blog/button-design"],
    [
      ["Everyday", "/designs/starter/collections/all"],
      ["Index", "/designs/collections/"],
      ["Famme", "/designs/famme/collections/all/"],
    ],
    [
      "Den samme filtermodellen brukes på mobil og desktop. Mobilvalg er et utkast frem til «Vis produkter»; Avbryt og Escape beholder forrige resultat.",
      "Mobile and desktop use the same filter model. Mobile choices remain a draft until “Show products”; Cancel and Escape preserve the previous results.",
    ],
    [
      [
        "På 390 px: åpne filtre, velg to egenskaper og sjekk at listen bak skuffen ikke endres.",
        "At 390 px: open filters, choose two attributes and verify the list behind the drawer has not changed.",
      ],
      [
        "Avbryt. Åpne igjen: utkastet skal være forkastet.",
        "Cancel. Reopen: the draft should have been discarded.",
      ],
      [
        "Bruk valgene. Brikker og URL skal oppdateres; fokus skal returnere til filterknappen.",
        "Apply choices. Chips and URL should update; focus should return to the filter trigger.",
      ],
    ],
    [
      "Lager leses først når tilgjengelighetsfilteret tas i bruk. Ved feil vises en melding; ukjent lager blir aldri lovet tilgjengelig.",
      "Stock is read when the availability filter is applied. Failures show a message; unknown stock is never promised as available.",
    ],
  ),
  topic(
    "product-lists",
    "discover",
    ["Sammenlign uten ekstra klikk", "Compare without unnecessary detours"],
    [
      "Vis pris og viktige egenskaper på kortet. Samle varianter i ett produktkort og bevar kundens plass når de vender tilbake fra produktet.",
      "Show prices and key attributes on the card. Group variants into one product card and preserve the shopper’s place when returning from a product.",
    ],
    [
      "Product listing UX",
      "https://baymard.com/blog/product-listing-page-plp-ux",
    ],
    [
      ["Index", "/designs/collections/?view=list"],
      ["Trade", "/designs/trade/"],
      ["Studio", "/designs/studio/"],
    ],
    [
      "Én produkt-ID grupperer variantene. Prisfiltrering og sortering bruker matchende varianter, og URL-en bevarer filtervalg, språk og visning.",
      "One product ID groups its variants. Price filtering and sorting use matching variants; the URL preserves filters, language and view.",
    ],
    [
      [
        "Sorter pris lav til høy: sammenlign den laveste matchende variantprisen.",
        "Sort by price low to high: compare the lowest matching variant price.",
      ],
      [
        "Åpne et produkt fra en filtrert liste og bruk Tilbake: samme filtre og visning skal komme tilbake.",
        "Open a product from a filtered list and use Back: the same filters and view should return.",
      ],
      [
        "Bytt til listevisning på mobil. Pris og handlingslenke skal være lesbare uten horisontal scrolling.",
        "Switch to list view on mobile. Price and action links must remain readable without horizontal scrolling.",
      ],
    ],
    [
      "Katalogene er små og viser alle treff. Last mer og spesifikasjonssammenligning er ikke nødvendige her; bruk dem først når sortimentet trenger det.",
      "These catalogs are small and show all matches. Load-more and specification comparison are unnecessary here; introduce them when the assortment needs them.",
    ],
  ),
  topic(
    "images",
    "evaluate",
    ["Bilder som er lette å utforske", "Images shoppers can explore"],
    [
      "Miniatyrbilder viser hva de ekstra bildene inneholder. Gjør dem tilgjengelige også på mobil, slik at flere bilder er lette å oppdage.",
      "Thumbnails show what additional images contain. Make them accessible on mobile too so shoppers can discover the other views.",
    ],
    [
      "Product gallery thumbnails",
      "https://baymard.com/research-articles/always-use-thumbnails-additional-images",
    ],
    [
      ["Famme jeans", "/designs/famme/products/baggy-jeans/"],
      ["Everyday", "/designs/starter/collections/all"],
      ["Lookbook", "/designs/lookbook/"],
    ],
    [
      "ReAI leverer produktbilder og alternativ tekst. Frontend velger galleri, miniatyrer og bildeformat. Famme demonstrerer flere lokale AVIF-bilder.",
      "ReAI supplies product images and alternative text. The frontend chooses the gallery, thumbnails and image format. Famme demonstrates several local AVIF views.",
    ],
    [
      [
        "Åpne Baggy Jeans på mobil. Flere bilder skal være synlige som miniatyrer.",
        "Open Baggy Jeans on mobile. Additional views should be visible as thumbnails.",
      ],
      [
        "Velg en miniatyr med tastatur: hovedbildet og valgt-markeringen skal endres.",
        "Choose a thumbnail with a keyboard: the main image and selected indicator should change.",
      ],
      [
        "Bytt produktfarge. Bildet skal vise den nye fargen.",
        "Change the product color. The image should show the new color.",
      ],
    ],
    [
      "Ingen automatisk karusell. Ingen ekstra bilder fabrikeres når et ekte produkt bare har ett publisert bilde.",
      "No automatic carousel. Additional views are not fabricated when a real product has only one published image.",
    ],
  ),
  topic(
    "variants",
    "evaluate",
    ["Synlige variantvalg", "Visible variant choices"],
    [
      "Synlige størrelsesknapper gjør tilgjengelige og utsolgte størrelser enklere å oppdage enn en lukket nedtrekksmeny.",
      "Visible size buttons make available and sold-out sizes easier to discover than a closed dropdown.",
    ],
    [
      "Size selection",
      "https://baymard.com/research-articles/use-buttons-for-size-selection",
    ],
    [
      ["Famme Softy", "/designs/famme/products/softy-straight-leg/"],
      ["Essential", "/designs/essential/"],
      ["Launch", "/designs/launch/"],
    ],
    [
      "Et farge- eller beløpsvalg peker på en variant, ikke bare en visuell etikett. Endret valg skal endre bilde/pris og tilgjengelighet før varen legges i kurven.",
      "A color or amount choice identifies a variant, not just a visual label. A changed choice must update image/price and availability before adding to cart.",
    ],
    [
      [
        "I Softy: brun L er merket utsolgt og kan ikke velges.",
        "In Softy: brown L is marked sold out and cannot be selected.",
      ],
      [
        "Velg brun XS, bytt til svart. En utilgjengelig tidligere størrelse skal ikke bli med videre.",
        "Choose brown XS, then change to black. An unavailable previous size must not carry through.",
      ],
      [
        "I Essential: velg 10 kr og sjekk at kurven viser akkurat det beløpet.",
        "In Essential: choose 10 kr and check that the cart shows that exact amount.",
      ],
    ],
    [
      "Beløpsknapper passer få varianter. Store variantsett trenger en struktur som fortsatt gjør aktuelle valg og tilgjengelighet synlige.",
      "Amount buttons suit a few variants. Larger sets need a structure that still exposes relevant choices and availability.",
    ],
  ),
  topic(
    "stock",
    "evaluate",
    [
      "Utsolgt, restordre og ukjent lager",
      "Sold out, backorder and unknown stock",
    ],
    [
      "Midlertidig utsolgte produkter trenger en vei videre. Restordre kan være nyttig når virksomheten faktisk kan levere senere og forklarer forventningene.",
      "Temporarily unavailable products need a path forward. Backorders can help when the business can actually deliver later and explains expectations.",
    ],
    [
      "Handling out-of-stock products",
      "https://baymard.com/research-articles/handling-out-of-stock-products",
    ],
    [
      ["Supply lab", "/scenarios/supply/"],
      ["Famme Softy", "/designs/famme/products/softy-straight-leg/"],
      ["Supply", "/designs/supply/"],
    ],
    [
      "Site API skiller tilgjengelighet fra produktdata. Checkout validerer på nytt. Tilbake-på-lager-varsler bruker variant-ID, egen tillatelse og en konfigurert flyt.",
      "The Site API separates availability from catalog data. Checkout revalidates. Back-in-stock alerts use the variant ID, separate permission and a configured flow.",
    ],
    [
      [
        "Bytt Supply-laben fra tilgjengelig til utsolgt: kjøpshandling skal stoppe.",
        "Switch the Supply lab from available to sold out: purchase actions should stop.",
      ],
      [
        "I Famme: svart XL skal si simulert restordre før det legges i testkurven.",
        "In Famme: black XL should say simulated backorder before adding to the test cart.",
      ],
      [
        "Test endret lager etter at varen ligger i kurven; vis problemet uten å miste de andre varene.",
        "Test changed stock after adding to cart; show the issue without losing the other items.",
      ],
    ],
    [
      "Lager- og restordrescenarier er isolerte UI-tester. Leveringsdato kan bare loves når virksomheten har faktiske data.",
      "Stock and backorder scenarios are isolated UI tests. Delivery dates can only be promised when the business has factual data.",
    ],
  ),
  topic(
    "cart",
    "buy",
    ["Antall, fjerning og angre", "Quantity, removal and undo"],
    [
      "Pluss/minus kombinert med et tallfelt gjør antallsendringer enklere. Oppdater summen automatisk og la kunden angre når en linje fjernes.",
      "Plus/minus paired with a number field makes quantity changes easier. Update totals automatically and let shoppers undo a removed line.",
    ],
    [
      "Cart quantity changes",
      "https://baymard.com/research-articles/auto-update-users-quantity-changes",
    ],
    [
      ["Everyday", "/designs/starter/collections/all"],
      ["Studio", "/designs/studio/"],
      ["Famme", "/designs/famme/collections/all/"],
    ],
    [
      "Kurven lagrer variant-ID og antall. Pris leses fra katalogen. Angre gjenoppretter siste fjernede linje; checkout håndterer endret lager og pris.",
      "The cart stores variant IDs and quantities. Prices come from the catalog. Undo restores the most recently removed line; checkout handles changed stock and prices.",
    ],
    [
      [
        "Legg til en vare. Øk til 3: linjesum, delsum og kurvantall skal oppdateres uten Lagre-knapp.",
        "Add an item. Increase to 3: line total, subtotal and cart count should update without a Save button.",
      ],
      [
        "Reduser fra 1 til 0: linjen fjernes. Angre skal gjenopprette den.",
        "Decrease from 1 to 0: the line disappears. Undo should restore it.",
      ],
      [
        "Lukk med Escape. Fokus skal returnere til kontrollen som åpnet skuffen.",
        "Close with Escape. Focus should return to the control that opened the drawer.",
      ],
    ],
    [
      "Kurvene til Everyday, live-demoen og Famme er separate. Angre sender aldri en refusjon eller endrer en allerede opprettet ordre.",
      "Everyday, the live demo and Famme have separate carts. Undo never sends a refund or changes an already created order.",
    ],
  ),
  topic(
    "costs",
    "buy",
    ["Forklar totalkostnaden tidlig", "Explain the total cost early"],
    [
      "Fraktkostnad påvirker produktvalget. Vis et relevant estimat eller forklar tydelig hva som gjenstår, fremfor å skjule kostnader til siste steg.",
      "Shipping cost affects product choice. Show a relevant estimate or explain clearly what remains to be calculated rather than hiding costs until the final step.",
    ],
    [
      "Shipping costs on product pages",
      "https://baymard.com/research-articles/show-shipping-costs-on-product-pages",
    ],
    [
      ["Checkout lab", "/ux/lab/checkout/"],
      ["Digitalt testprodukt", "/products/test-betaling/"],
      ["Everyday shipping", "/designs/starter/pages/shipping"],
    ],
    [
      "Butikken viser katalogpris. ReAI beregner endelig rabatt, avgift og frakt i checkout. Digitale testprodukter har ingen fysisk frakt.",
      "The storefront displays catalog prices. ReAI calculates final discounts, taxes and shipping in checkout. Digital test products have no physical shipping.",
    ],
    [
      [
        "I laben: bytt fra frakt til henting. Fraktlinje og total skal endres samtidig.",
        "In the lab: switch from shipping to pickup. Shipping and total should change together.",
      ],
      [
        "Endre antall og kontroller at enhetspris × antall pluss frakt stemmer.",
        "Change quantity and verify unit price × quantity plus shipping matches the total.",
      ],
      [
        "Åpne en ekte testvare: det skal fremgå at den ikke sendes fysisk.",
        "Open a real test item: it should be clear that it is not physically shipped.",
      ],
    ],
    [
      "Fraktpriser i laben er fiktive. Den viser grensesnittet, ikke et Bring-tilbud eller en transportørbooking.",
      "Lab shipping prices are fictional. It demonstrates the interface, not a Bring quote or carrier booking.",
    ],
  ),
  topic(
    "guest-checkout",
    "buy",
    ["Kjøp uten påtvunget konto", "Buy without forced account creation"],
    [
      "Gjestecheckout bør være lett å finne og bruke. Kontoopprettelse skal ikke være en nødvendig omvei for en kunde som bare vil kjøpe.",
      "Guest checkout should be easy to find and use. Account creation should not be a required detour for someone who simply wants to buy.",
    ],
    [
      "Guest checkout prominence",
      "https://baymard.com/research-articles/make-guest-checkout-prominent",
    ],
    [
      ["Checkout lab", "/ux/lab/checkout/"],
      ["Trade", "/designs/trade/"],
      ["Kjøpssjekkliste", "/learn/checkout-test/"],
    ],
    [
      "Butikken oppretter en hosted checkout med publiserte variant-ID-er. Privat- og bedriftskjøp kan ha ulike felt; betaling nå og faktura er forskjellige utfall.",
      "The storefront creates a hosted checkout using published variant IDs. Personal and business purchases may need different fields; immediate payment and invoice orders have different outcomes.",
    ],
    [
      [
        "Fullfør laben som gjest uten passord eller konto.",
        "Complete the lab as a guest without a password or account.",
      ],
      [
        "Bytt til bedrift: organisasjonsnummer blir relevant, mens gjestevalget beholdes.",
        "Switch to business: organization number becomes relevant while guest access remains.",
      ],
      [
        "Velg faktura i laben: bekreftelsen skal si ubetalt, ikke betalt.",
        "Choose invoice in the lab: confirmation should say unpaid, not paid.",
      ],
    ],
    [
      "Laben oppretter ingen konto eller ordre. Ekte fakturakjøp krever merchant-oppsett; EHF sendes ved fakturering, ikke ved valg i denne laben.",
      "The lab creates no account or order. Real invoice purchases require merchant configuration; EHF is sent during invoicing, not by a selection in this lab.",
    ],
  ),
  topic(
    "delivery",
    "buy",
    ["Frakt og henting i samme valg", "Shipping and pickup in one choice"],
    [
      "Vis alle tilgjengelige leveringsmåter der kunden velger levering. Forklar kostnad, sted og tidspunkt før kunden bestemmer seg.",
      "Show all available fulfillment methods where shoppers choose fulfillment. Explain cost, location and timing before they decide.",
    ],
    [
      "Fulfillment selection",
      "https://baymard.com/research-articles/store-pickup-as-shipping-option",
    ],
    [
      ["Checkout lab", "/ux/lab/checkout/"],
      ["Plattformens frakt", "/learn/shipping/"],
      ["Henting i ReAI", "/learn/shipping/"],
    ],
    [
      "En fysisk butikk konfigurerer transportør og hentested i ReAI. Laben viser begge samtidig og bevarer adresse når du bytter frem og tilbake.",
      "A physical store configures carriers and pickup locations in ReAI. The lab shows both together and preserves the address when switching back and forth.",
    ],
    [
      [
        "Fyll testadresse, velg henting, og bytt til frakt igjen: adressen skal være bevart.",
        "Enter a test address, select pickup, then return to shipping: the address should be preserved.",
      ],
      [
        "Henting skal ikke kreve gateadresse, men tydelig vise valgt hentested.",
        "Pickup should not require a street address but should clearly show the pickup location.",
      ],
      [
        "Begge leveringsvalg og prisene skal være synlige på mobil.",
        "Both fulfillment choices and prices should be visible on mobile.",
      ],
    ],
    [
      "Ikke bruk labens tider som leveringsløfter. Digitale varer i live-demoen oppretter ingen sending.",
      "Do not treat lab timings as delivery promises. Live-demo digital products create no shipment.",
    ],
  ),
  topic(
    "payment",
    "buy",
    ["Forklar neste steg i betaling", "Explain the next payment step"],
    [
      "Vis total før betaling og bruk en knappetekst som beskriver neste steg. Betalingsvalg skal være tydelige, med forklaring når kunden forlater butikken.",
      "Show the total before payment and label the button with the next step. Payment choices should be clear, including any departure from the storefront.",
    ],
    ["Payment UX", "https://baymard.com/blog/payment-ux"],
    [
      ["Checkout lab", "/ux/lab/checkout/"],
      ["ReAI checkout", "/cart/"],
      ["Adyen", "/learn/payments/"],
    ],
    [
      "ReAI hosted checkout håndterer Adyen. Tilgjengelige metoder avhenger av merchant, land, enhet og oppsett. Butikkens returadresse er ikke bevis på betaling.",
      "ReAI hosted checkout handles Adyen. Available methods depend on merchant, country, device and configuration. A storefront return URL is not proof of payment.",
    ],
    [
      [
        "I laben: gjennomgå vare, levering og total før simulert betaling.",
        "In the lab: review the item, fulfillment and total before simulated payment.",
      ],
      [
        "Velg mislykket betaling: ingen betalt bekreftelse skal vises.",
        "Choose failed payment: no paid confirmation should appear.",
      ],
      [
        "Velg avventer: resultatet skal tydelig si at betaling ikke er bekreftet.",
        "Choose pending: the result should clearly state payment is unconfirmed.",
      ],
    ],
    [
      "Laben har ingen Adyen Drop-in eller wallet-integrasjon. Bruk ekte checkout for å kontrollere tilgjengelige metoder, uten å sende betaling ved UI-testing.",
      "The lab has no Adyen Drop-in or wallet integration. Use real checkout to inspect available methods without submitting a payment during UI testing.",
    ],
  ),
  topic(
    "errors",
    "buy",
    ["Feil som kan rettes", "Errors shoppers can correct"],
    [
      "Ved en feil skal kunden beholde det de har skrevet og finne hva som må rettes. Forklar problemet ved feltet og gjør neste handling tydelig.",
      "After an error, shoppers should retain their input and find what needs correction. Explain the problem at the field and make the next action clear.",
    ],
    [
      "Checkout error recovery",
      "https://baymard.com/blog/checkout-flow-ux-optimization",
    ],
    [
      ["Checkout lab", "/ux/lab/checkout/"],
      ["Everyday", "/designs/starter/collections/all"],
      ["Supply lab", "/scenarios/supply/"],
    ],
    [
      "Nettverksfeil, prisendring og lagerkonflikt er forskjellige problemer. Vis årsak når den er kjent; behold kurv og inndata. Ikke erstatt live-data med fiktive varer.",
      "Network errors, price changes and stock conflicts are different problems. Show the cause when known; preserve the cart and inputs. Never replace live data with fictional products.",
    ],
    [
      [
        "La e-post være tom i laben: sammendrag og feltmelding skal hjelpe deg til feltet.",
        "Leave email empty in the lab: the summary and field message should guide you to the field.",
      ],
      [
        "Prøv ugyldig postnummer og rett det. Navn og adresse skal beholdes.",
        "Try an invalid postal code, then fix it. Name and address should remain.",
      ],
      [
        "Simuler betalingsfeil og prøv igjen: behold leveringsvalg og antall.",
        "Simulate payment failure and retry: preserve fulfillment and quantity.",
      ],
    ],
    [
      "Labens validering demonstrerer norske testfelt. Produksjonscheckout har servervalidering og må testes separat for aktuelle land og virksomhet.",
      "Lab validation demonstrates Norwegian test fields. Production checkout has server validation and must be tested separately for relevant countries and businesses.",
    ],
  ),
  topic(
    "after-purchase",
    "retain",
    ["Bekreft først, inviter videre etterpå", "Confirm first, invite later"],
    [
      "Etter kjøpet kan kunden inviteres til videre engasjement uten å avbryte checkout. Forklar konkrete fordeler ved valgfrie handlinger.",
      "After purchase, optional engagement can be offered without interrupting checkout. Explain concrete benefits of optional actions.",
    ],
    [
      "Post-checkout UX",
      "https://baymard.com/research-articles/post-checkout-ux-best-practices",
    ],
    [
      ["Checkout lab", "/ux/lab/checkout/"],
      ["Nyhetsbrev", "/#newsletter"],
      ["Lookbook", "/designs/lookbook/"],
    ],
    [
      "Vis bekreftet ordrestatus og eventuell betalingsstatus. Skill betalt fra avventer og ubetalt faktura. Nyhetsbrev bruker egen tillatelse. Manuelle gavekort forklarer innløsning via e-post.",
      "Show verified order status and any payment status. Distinguish paid from pending and unpaid invoices. Newsletter signup requires separate consent. Manual gift cards explain email redemption.",
    ],
    [
      [
        "Simuler betalt, avventer og faktura: hver bekreftelse må ha riktig status.",
        "Simulate paid, pending and invoice: each confirmation must show the correct status.",
      ],
      [
        "Bekreftelsen skal vise vare, total og neste steg før videre inspirasjon.",
        "Confirmation should show the item, total and next step before further inspiration.",
      ],
      [
        "Nyhetsbrev skal være frivillig og aldri forhåndsvalgt som del av kjøpet.",
        "Newsletter signup should be optional and never preselected as part of purchase.",
      ],
    ],
    [
      "Laben sender ingen bekreftelse. Demoens ekte retur-side viser ikke betalt ut fra URL alene. Ingen kundekonto- eller anmeldelsestjeneste loves.",
      "The lab sends no confirmation. The demo’s real return page does not infer paid status from a URL. No customer-account or reviews service is promised.",
    ],
  ),
];
export const uxTopics = [...baseTopics.map((t) => ({ ...t, ...topicDepth[t.slug], cases: [...t.cases, ...topicDepth[t.slug].extra] })), ...additionalTopics, ...commerceTopics, ...libraryTopics].map(t => ({...t, title: topicTitles[t.slug] || t.title, group: groupForTopic(t.slug).slug}));
uxTopics.find(t => t.slug === "product-lists").examples.push(["Product decision lab", "/ux/lab/product/"]);
export const acceptanceCount = uxTopics.reduce((n, t) => n + t.cases.length, 0);
export const designTopics = {
  starter: ["breadcrumbs", "sorting", "search", "filters", "mobile-filters", "cart", "images", "errors"],
  collections: [
    "navigation",
    "search",
    "filters",
    "mobile-filters",
    "product-lists", "breadcrumbs", "sorting",
  ],
  famme: [
    "navigation",
    "filters",
    "mobile-filters",
    "variants",
    "images",
    "stock",
    "cart", "size-guide", "breadcrumbs", "product-sections",
  ],
  lookbook: ["navigation", "images", "variants", "cart"],
  essential: ["navigation", "variants", "cart", "costs"],
  launch: ["navigation", "variants", "cart", "payment"],
  trade: ["product-lists", "variants", "guest-checkout", "cart"],
  studio: ["product-lists", "variants", "cart"],
  atelier: ["navigation", "images", "cart"],
  supply: ["stock", "variants", "cart"],
};
export const uxRoutes = [
  "/ux",
  "/ux/library",
  "/ux/lab/checkout",
  "/ux/lab/discovery",
  "/ux/lab/compare",
  "/ux/test-plan",
  "/ux/lab/product",
  "/ux/worksheet",
  ...uxGroups.map(g => `/ux/group/${g.slug}`),
  ...uxTopics.map((t) => `/ux/${t.slug}`),
];
