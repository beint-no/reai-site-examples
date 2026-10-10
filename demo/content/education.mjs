// Educational copy is static; the connected shop and explorer use ReAI delivery data.
export const lessons = [
  {
    slug: "newsletter",
    shortTitle: ["Samtykke", "Consent"],
    icon: "@",
    tag: ["SITE API", "SITE API"],
    title: ["E-postpåmelding, med samtykke.", "Email signup, with consent."],
    summary: [
      "En liten form. Et eksplisitt samtykke, lagret hos Site-eieren.",
      "A small form. Explicit consent, recorded for the Site owner.",
    ],
    intro: [
      "La besøkende be om nyheter fra virksomheten. Worker sender påmeldingen til ReAI med en avgrenset Site-nøkkel; samtykket lagres i kunderegisteret.",
      "Let visitors ask for news from the business. The Worker submits the signup using a scoped Site credential; consent is stored in the customer register.",
    ],
    steps: [
      [
        "Oppgi e-post og kryss selv av for nyhetsbrev fra den navngitte virksomheten.",
        "Enter an email and explicitly opt in to news from the named business.",
      ],
      [
        "Worker validerer en begrenset forespørsel og bruker newsletter:subscribe. Nøkkelen vises aldri i nettleseren.",
        "The Worker validates a bounded request and uses newsletter:subscribe. The credential never reaches the browser.",
      ],
      [
        "ReAI gjenbruker en eksisterende kontakt eller oppretter en ny, uten å overskrive eksisterende kundedetaljer.",
        "ReAI reuses an existing contact or creates one without overwriting existing customer details.",
      ],
      [
        "Du får samme kvittering for ny og eksisterende kontakt. Kallet sender ingen e-post og oppretter ingen rabatt.",
        "New and existing contacts receive the same receipt. The request sends no email and creates no discount.",
      ],
    ],
    sections: [
      {
        title: ["Samtykke er ikke en kampanje", "Consent is not a campaign"],
        text: [
          "Dette API-et registrerer ønsket om nyhetsbrev. Det er ikke en utsendelsesmotor eller automatisk velkomstrabatt. Virksomheten må håndtere utsendelse og tilbaketrekking av samtykke. I demoen kan du kontakte post+owner@reai.no for å trekke det tilbake.",
          "This API records a newsletter request. It is not an email campaign engine or automatic welcome discount. The business handles sending and consent withdrawal. In this demo, contact post+owner@reai.no to withdraw consent.",
        ],
      },
      {
        title: ["Gjenta uten duplikater", "Repeat without duplicates"],
        text: [
          "Gjentatte påmeldinger er idempotente. Svaret avslører ikke om adressen allerede var en kunde. Avkrysningsboksen er tom til brukeren velger den, og consent må være true.",
          "Repeated subscriptions are idempotent. The response does not reveal whether the address was already a customer. The checkbox starts unchecked and consent must be true.",
        ],
      },
    ],
    links: [
      ["/#newsletter", ["Prøv påmeldingsskjemaet", "Try the signup form"]],
      ["/privacy/", ["Personvern og samtykke", "Privacy and consent"]],
    ],
    code: 'POST /site/v1/newsletter/subscriptions\nAuthorization: Bearer <server-only Site credential>\n\n{ "email": "you@example.com", "consent": true }\n\n200 { "accepted": true }',
    codeLabel: [
      "Ingen markedparameter er nødvendig. Site-nøkkelen bestemmer eieren.",
      "No market parameter is needed. The Site credential identifies the owner.",
    ],
  },

  {
    slug: "payments",
    shortTitle: ["Betaling", "Payments"],
    icon: "↗",
    tag: ["EKTE CHECKOUT", "REAL CHECKOUT"],
    title: [
      "Én checkout. Mange måter å betale.",
      "One checkout. Many ways to pay.",
    ],
    summary: [
      "ReAI tar kurven videre til Adyen, med betalingsmåter som passer kunden og butikken.",
      "ReAI takes the cart to Adyen, with payment methods suited to the shopper and merchant.",
    ],
    intro: [
      "Kort, Vipps eller en digital lommebok? Butikken leverer kurven. ReAI og Adyen håndterer resten av betalingsflyten.",
      "Card, Vipps or a digital wallet? The store supplies the cart. ReAI and Adyen handle the payment flow.",
    ],
    steps: [
      [
        "Velg en variant og legg den i kurven.",
        "Choose a variant and add it to the cart.",
      ],
      [
        "Worker oppretter en checkout med en unik idempotensnøkkel. ReAI validerer pris og tilgjengelighet.",
        "The Worker creates a checkout with a unique idempotency key. ReAI validates prices and availability.",
      ],
      [
        "Hosted checkout samler kundeopplysninger og viser tilgjengelige betalingsmåter. Adyen håndterer betalingsopplysningene.",
        "Hosted checkout collects customer details and shows available payment methods. Adyen handles payment details.",
      ],
      [
        "ReAI følger betalingsstatus. En retur til butikken beviser ikke at betalingen er fullført.",
        "ReAI tracks payment status. Returning to the store does not prove payment succeeded.",
      ],
    ],
    sections: [
      {
        title: ["Betalingsmenyen", "The payment menu"],
        text: [
          "Denne demoens merchant-oppsett tilbyr kort (Visa, Mastercard og American Express), Vipps, Apple Pay, Google Pay og Klarna (betal senere og delbetaling). Hvilke valg som faktisk vises, avhenger av enhet, nettleser, kunde, land og merchant-konfigurasjon. Checkout viser fasiten.",
          "This demo’s merchant configuration offers cards (Visa, Mastercard and American Express), Vipps, Apple Pay, Google Pay and Klarna (pay later and installments). Actual availability depends on device, browser, shopper, country and merchant configuration. Checkout is authoritative.",
        ],
      },
      {
        title: [
          "Et nettsted trenger ikke å behandle kortdata",
          "A website does not need to handle card data",
        ],
        text: [
          "Site-nøkkelen blir på Worker. Nettleseren sender variant-ID og antall, aldri en pris som ReAI må stole på. Den åpner kun checkout-URL-en fra den godkjente ReAI-serveren. Hosted checkout håndterer betalingsvalg og eventuelle ekstra autentiseringstrinn.",
          "The Site credential stays on the Worker. The browser sends variant IDs and quantities, never a price ReAI must trust. It opens only the checkout URL from the approved ReAI server. Hosted checkout handles payment selection and any additional authentication steps.",
        ],
      },
      {
        title: [
          "Et demo-domene gjør ikke betalingen til en test",
          "A demo domain does not make a payment a test",
        ],
        text: [
          "Adyen TEST og LIVE er ulike betalingsmiljøer. Et preview-domene eller en tenant med «test» i navnet bytter ikke betalingsmiljø. Se betalingsmodus og mottaker før checkout. Du kan utforske kurv og checkout uten å fullføre en betaling.",
          "Adyen TEST and LIVE are separate payment environments. A preview domain or a tenant with “test” in its name does not change the payment environment. Check the payment mode and recipient before checkout. You can explore the cart and checkout without completing a payment.",
        ],
      },
    ],
    links: [
      ["/cart/", ["Se kurven", "See the cart"]],
      ["/learn/business/", ["Bedrift og faktura", "Business and invoicing"]],
      [
        "https://docs.adyen.com/payment-methods/",
        ["Adyens betalingsmåter", "Adyen payment methods"],
      ],
    ],
    code: 'POST /site/v1/commerce/checkout-sessions?market=default&locale=nb-NO\nIdempotency-Key: <unique UUID>\n\n{ "lines": [{ "variantId": "<public variant UUID>", "quantity": 1 }],\n  "returnUrl": "https://nettbutikk.reai.no/checkout/return/" }',
    codeLabel: [
      "Kallet fra Worker → ReAI. Site-nøkkelen sendes bare fra serveren.",
      "Worker → ReAI request. The Site credential is sent only from the server.",
    ],
  },
  {
    slug: "business",
    shortTitle: ["B2B / EHF", "B2B / EHF"],
    icon: "B2B",
    tag: ["BEDRIFT + FAKTURA", "BUSINESS + INVOICING"],
    title: [
      "Bedrift i kurven. EHF i regnskapet.",
      "Business in the cart. EHF in the books.",
    ],
    summary: [
      "Firmasøk, fakturaordre og EHF via Peppol. En ordre, en sendt faktura og en betaling er tre ulike steg.",
      "Company search, invoice orders and EHF over Peppol. An order, a sent invoice and a payment are three separate steps.",
    ],
    intro: [
      "Trenger bedriften faktura fremfor kortbetaling? Samme checkout kan ta imot begge deler. ReAI knytter ordren til firmaet og følger fakturaen videre.",
      "Does your business need an invoice rather than a card payment? The same checkout can accept both. ReAI connects the order to the company and follows the invoice onward.",
    ],
    steps: [
      [
        "Åpne checkout, velg Bedrift og finn et norsk firma med firmasøket.",
        "Open checkout, choose Company and find a Norwegian company using company search.",
      ],
      [
        "Velg Faktura og kontroller kontaktopplysninger, rabatt og levering. Sluttknappen oppretter en ekte, ubetalt ordre.",
        "Choose Invoice and review contact details, discount and delivery. The final button creates a real, unpaid order.",
      ],
      [
        "Selger behandler ordren og utsteder faktura i ReAI. EHF kan sendes til en mottaker som er registrert i Peppol-nettverket.",
        "The merchant processes the order and issues an invoice in ReAI. EHF can be sent to a recipient registered in the Peppol network.",
      ],
      [
        "Fakturalevering og betaling følges separat. EHF-levering betyr ikke at fakturaen er betalt.",
        "Invoice delivery and payment are tracked separately. EHF delivery does not mean the invoice is paid.",
      ],
    ],
    sections: [
      {
        title: ["EHF er mer enn en PDF", "EHF is more than a PDF"],
        text: [
          "EHF er strukturert elektronisk fakturadata som kan behandles av mottakerens økonomisystem. ReAI støtter norske EHF-fakturaer og kreditnotaer gjennom Peppol. Mottaker må kunne motta dokumenttypen i nettverket; et organisasjonsnummer eller et firmasøk alene er ikke en leveringsbekreftelse.",
          "EHF is structured electronic invoice data that the recipient’s accounting system can process. ReAI supports Norwegian EHF invoices and credit notes through Peppol. The recipient must support the document type in the network; an organization number or company search alone is not a delivery confirmation.",
        ],
      },
      {
        title: [
          "Fra fakturaordre til sendt faktura",
          "From invoice order to sent invoice",
        ],
        text: [
          "Fakturavalg i checkout oppretter en ordre, ikke en ferdig utstedt EHF-faktura. For norske firmakunder med gyldig organisasjonsnummer velger ReAI normalt EHF på ordren. Ved fakturautstedelse forsøkes EHF når det er valgt og støttet. Konfigurert faktura-e-post brukes som alternativ når EHF ikke kan leveres. Selger kan kontrollere faktura og leveringshistorikk i ReAI.",
          "Choosing Invoice in checkout creates an order, not an already-issued EHF invoice. For Norwegian business customers with a valid organization number, ReAI normally selects EHF on the order. On invoice issuance, EHF is attempted when selected and supported. The configured invoice email is used as an alternative when EHF cannot be delivered. The merchant can inspect the invoice and delivery history in ReAI.",
        ],
      },
      {
        title: ["Aktivert i denne demoen", "Enabled in this demo"],
        text: [
          "Bedrift og fakturaordre er aktivert for demoens Site hos Better Integration. Tenanten er allerede EHF-registrert og har en aktiv NOK-mottakerkonto. Dette bekrefter oppsett, ikke at en bestemt utgående faktura er levert. Du kan utforske valg og firmasøk uten å sende en ordre. Fullfører du, er det en ekte ordre — ikke en simulering.",
          "Company checkout and invoice orders are enabled for the demo Site at Better Integration. The tenant is already EHF-registered and has an active NOK receiving account. This confirms configuration, not delivery of a particular outgoing invoice. You can explore the options and company search without submitting an order. Completing checkout creates a real order, not a simulation.",
        ],
      },
      {
        title: [
          "Faktura er ikke Adyen-betaling",
          "An invoice is not an Adyen payment",
        ],
        text: [
          "Fakturaalternativet oppretter en ubetalt ordre uten å trekke kortet via Adyen. Betalingsfrist og mottakerkonto styres av fakturaoppsettet i ReAI. Kort og lommebøker bruker den separate Adyen-flyten. Rabatter og fysisk levering valideres i checkout også for fakturaordrer.",
          "The invoice option creates an unpaid order without charging a card through Adyen. Payment terms and receiving account come from ReAI invoice configuration. Cards and wallets use the separate Adyen flow. Discounts and physical delivery are validated in checkout for invoice orders too.",
        ],
      },
    ],
    links: [
      ["/cart/", ["Utforsk checkout", "Explore checkout"]],
      ["/learn/shipping/", ["Frakt og hent selv", "Shipping and local pickup"]],
      [
        "https://www.anskaffelser.no/kategorispesifik-veiledning/fagsystemer-digitale-anskaffelser/elektronisk-handelsformat-ehf",
        ["DFØ: Slik fungerer EHF", "DFØ: How EHF works"],
      ],
    ],
    code: '# Enable company checkout for one Site (operator only)\nPUT /api/sites/{siteId}/commerce/business-sales\n{ "enabled": true }\n\n# Create the usual Site checkout session.\n# Company search and invoice choice happen in hosted checkout.\n# The merchant issues the invoice later in ReAI;\n# checkout does not submit an EHF invoice itself.',
    codeLabel: [
      "Oppsett bruker management-API-et. Site-nøkkelen gir ingen tilgang til fakturaer eller bankkontoer.",
      "Configuration uses the management API. The Site credential gives no access to invoices or bank accounts.",
    ],
  },
  {
    slug: "shipping",
    shortTitle: ["Frakt", "Shipping"],
    icon: "◇",
    tag: ["INTEGRERT I REAI", "INTEGRATED IN REAI"],
    title: [
      "Fra handlekurv til hentested.",
      "From shopping cart to pickup point.",
    ],
    summary: [
      "Bring og PostNord, hentesteder og hent selv hos selger. Ulike leveringsvalg, samme ordre.",
      "Bring and PostNord, pickup points and collection from the merchant. Different delivery choices, one order.",
    ],
    intro: [
      "Frakt er mer enn et tall på siste side. ReAI kobler butikkens prisregler til leveringsmåter, adresse og pakkens egenskaper.",
      "Shipping is more than a number on the last page. ReAI connects merchant price rules to delivery methods, address and parcel details.",
    ],
    steps: [
      [
        "Butikken konfigurerer leveringsmåter og kundepriser per marked.",
        "The merchant configures delivery methods and customer prices per market.",
      ],
      [
        "Checkout vurderer adresse, vekt, pakkemål og leveringsmåte før den viser tilgjengelige valg.",
        "Checkout checks address, weight, parcel dimensions and delivery method before showing eligible options.",
      ],
      [
        "Ved hentested eller pakkeboks velger kunden en lokasjon. ReAI validerer det valgte alternativet.",
        "For pickup points or lockers, the shopper selects a location. ReAI validates the selected option.",
      ],
      [
        "Godkjente leveringsdetaljer lagres med ordren. Forsendelsen bookes senere med egne transportørkontroller.",
        "Accepted delivery details are stored with the order. The shipment is booked later with separate carrier checks.",
      ],
    ],
    sections: [
      {
        title: ["Bring + PostNord", "Bring + PostNord"],
        text: [
          "ReAI støtter kombinasjoner av transportør og leveringstype, blant annet postkasse, hentested, pakkeboks, hjemlevering og bedrift. Ikke alle typer finnes hos begge transportører eller for alle pakker. Butikkhenting kan også konfigureres. Støttede kombinasjoner finnes i management-API-et.",
          "ReAI supports carrier and delivery-method combinations including mailbox, pickup point, parcel locker, home delivery and business. Not every method is available with both carriers or for every parcel. Store pickup can also be configured. Supported combinations are listed in the management API.",
        ],
      },
      {
        title: [
          "Kundepris og transportørkostnad er ulike ting",
          "Customer price and carrier cost are different things",
        ],
        text: [
          "Checkout bruker butikkens konfigurerte priser, eventuell fraktfri grense og vektregel. Dette er ikke et sanntidspristilbud fra transportøren. Lokalt tilgjengelige valg garanterer heller ikke at en fremtidig booking blir godkjent. Hentesteder kontrolleres for det valgte alternativet.",
          "Checkout uses configured merchant prices, any free-shipping threshold and weight rule. This is not a live carrier-cost quote. Locally eligible options also do not guarantee a future booking will be accepted. Pickup locations are checked for the selected option.",
        ],
      },
      {
        title: ["Hent selv hos selger", "Collect from the merchant"],
        text: [
          "Butikkhenting er et eget, gratis leveringsvalg med selgers henteinstruksjoner. Det bruker verken Bring/PostNord-hentested eller transportørbooking. Checkout lagrer henteinstruksjonene på ordren; kunden trenger ingen leveringsadresse for dette valget. Det kan kombineres med kortbetaling eller en B2B-fakturaordre.",
          "Store pickup is a separate, free delivery choice with merchant collection instructions. It uses neither a Bring/PostNord pickup point nor carrier booking. Checkout saves the collection instructions on the order; this option requires no delivery address. It can be combined with card payment or a B2B invoice order.",
        ],
      },
      {
        title: [
          "Hva skjer i akkurat denne demoen?",
          "What happens in this particular demo?",
        ],
        text: [
          "Demoens marked har fire transportørvalg og «Hent selv · kun demo / demo only». Alle nåværende produkter er digitale, så checkout viser ingen leverings- eller hentevalg for disse kurvene. Demo-henting lover ingen fysisk vare eller hentested. En ekte butikk må erstatte henteinstruksjonene med reell adresse og rutiner. Transportørfrakt krever også fraktmodul, avsender, pakkemål og gyldige produktvekter.",
          "The demo market has four carrier methods and “Hent selv · kun demo / demo only”. All current products are digital, so checkout shows no delivery or pickup choices for those carts. Demo pickup promises no physical goods or collection location. A real store must replace the collection instructions with its actual address and process. Carrier shipping also needs the shipping module, sender, parcel dimensions and valid product weights.",
        ],
      },
    ],
    links: [
      [
        "https://app.reai.no/openapi/public/ui",
        ["Se fraktkontrakten", "Read the shipping contract"],
      ],
      [
        "/learn/discounts/",
        ["Fraktfrihet og rabattkoder", "Free shipping and discount codes"],
      ],
    ],
    code: "GET /api/sites/shipping-options\nPOST /api/sites/{siteId}/commerce/markets/{marketId}/shipping-methods\nPOST /api/sites/{siteId}/commerce/markets/{marketId}/shipping-methods/pickup\n\n# Management API: authenticated operator, explicit X-Tenant-Id.\n# Shipping selection happens in hosted checkout, not /site/v1 reads.",
    codeLabel: [
      "Oppsett for operatøren. Management-nøkkel skal aldri være i nettsiden.",
      "Operator configuration. A management credential must never be in the website.",
    ],
  },
  {
    slug: "discounts",
    shortTitle: ["Rabatter", "Discounts"],
    icon: "%",
    tag: ["PRØV I CHECKOUT", "TRY IN CHECKOUT"],
    title: [
      "Rabatter med litt mer hjerne.",
      "Discounts with a little more brain.",
    ],
    summary: [
      "Prosent, samlingsregler, minstebeløp og fraktfrihet. ReAI regner — nettleseren gjetter ikke.",
      "Percentages, collection rules, minimum spend and free shipping. ReAI calculates — the browser does not guess.",
    ],
    intro: [
      "Rabattkoder hører hjemme der priser og regler bor. Her kan du prøve både en kode for hele katalogen og en for én samling.",
      "Discount codes belong where prices and rules live. Here you can try both a whole-catalog code and a collection-scoped code.",
    ],
    steps: [
      [
        "Legg et demo-produkt i kurven og åpne ReAI checkout.",
        "Add a demo product to your cart and open ReAI checkout.",
      ],
      [
        "Skriv REAI-DEMO10 i rabattfeltet: 10 % på alle produktlinjer.",
        "Enter REAI-DEMO10 in the discount field: 10% off all product lines.",
      ],
      [
        "Eller prøv REAI-MAGI20 på Kontormagi: 20 % når kvalifiserende produktlinjer er minst 100 kr før rabatt.",
        "Or try REAI-MAGI20 on Office magic: 20% when eligible product lines total at least 100 kr before discount.",
      ],
      [
        "Se ReAIs nye totalsum. En kode gir ikke automatisk rabatten til produkter utenfor den valgte samlingen.",
        "See the new ReAI total. A code does not automatically discount products outside the selected collection.",
      ],
    ],
    sections: [
      {
        title: ["Tre regler å prøve", "Three rules to try"],
        text: [
          "REAI-DEMO10 gjelder hele demo-katalogen. REAI-MAGI20 gjelder bare Kontormagi med minst 100 kr i kvalifiserende produkter. REAI-FRAKT demonstrerer en fraktfri kode uten prosentrabatt; den sparer ingen frakt på disse digitale produktene. Kodene gjelder kun denne demoens marked.",
          "REAI-DEMO10 applies to the whole demo catalog. REAI-MAGI20 applies only to Office magic with at least 100 kr in eligible products. REAI-FRAKT demonstrates a free-shipping code without a percentage discount; it saves no shipping on these digital products. Codes apply only to this demo market.",
        ],
      },
      {
        title: ["Planlegg, avgrens og skru av", "Schedule, scope and disable"],
        text: [
          "Management-API-et støtter starttid, sluttid, aktivering, prosent, minstebeløp, samlingsavgrensning og fraktfrihet. Minstebeløpet beregnes av kvalifiserende produktlinjer før rabatt og frakt. En kode kan gi fraktfrihet når den kvalifiserer, også om bare en del av kurven er rabattberettiget.",
          "The management API supports start/end times, enablement, percentage, minimum spend, collection scope and free shipping. Minimum spend counts eligible product lines before discount and shipping. A qualifying code can waive shipping even when only part of the cart qualifies for the product discount.",
        ],
      },
      {
        title: [
          "Førpris er et eget felt",
          "Compare-at price is a separate field",
        ],
        text: [
          "Mandagsmot har en illustrativ sammenligningspris fra ReAI-prislisten. Feltet compareAtPrice er visningsdata, ikke en rabattkode eller bevis på en tidligere salgspris. Produktets price er beløpet før eventuelle checkout-rabatter. Her er begge beløp fiktive demonstrasjoner.",
          "Monday courage has an illustrative reference price from the ReAI price list. compareAtPrice is display data, not a discount code or proof of a previous selling price. The product’s price is the amount before any checkout discount. Both amounts here are fictional demonstrations.",
        ],
      },
      {
        title: [
          "Hvorfor ligger ikke koden i sesjonskallet?",
          "Why is the code not in the session request?",
        ],
        text: [
          "Site API oppretter checkout med variant-ID, antall og retur-URL. Kunden legger til eller fjerner kode i hosted checkout. Butikken beregner ikke rabatten lokalt, og en ugyldig kode blir avvist av ReAI.",
          "The Site API creates checkout from variant IDs, quantities and a return URL. The shopper adds or removes a code in hosted checkout. The store does not calculate discounts locally, and ReAI rejects an invalid code.",
        ],
      },
    ],
    links: [
      ["/collections/kontor-magi/", ["Prøv Kontormagi", "Try Office magic"]],
      [
        "/products/mandagsmot/",
        ["Se sammenligningspris", "See compare-at price"],
      ],
    ],
    code: '# Operator example: scoped code for this Site and market\nPOST /api/sites/{siteId}/commerce/markets/{marketId}/discounts\n{ "code": "REAI-MAGI20", "percentage": 20,\n  "collectionId": "<office-magic collection UUID>",\n  "minimumProductGross": 100, "startsAt": "<ISO instant>" }',
    codeLabel: [
      "Bare management-API-et oppretter regler. Hosted checkout validerer innløsing.",
      "Only the management API creates rules. Hosted checkout validates redemption.",
    ],
  },
  {
    slug: "catalog",
    shortTitle: ["Katalog", "Catalog"],
    icon: "✳",
    tag: ["LIVE PRODUKTDATA", "LIVE PRODUCT DATA"],
    title: [
      "En katalog. Mange små superkrefter.",
      "One catalog. Many little superpowers.",
    ],
    summary: [
      "Varianter, bilder, manuelle og automatiske samlinger, pris og lager — med én datakilde.",
      "Variants, images, manual and automated collections, prices and stock — with one source of truth.",
    ],
    intro: [
      "Produkter administreres i ReAI og publiseres til en bestemt Site. Denne siden lager ikke sin egen parallelle produktdatabase.",
      "Products are managed in ReAI and published to a specific Site. This website does not create a second product database.",
    ],
    steps: [
      [
        "Heia, ReAI! viser én produktidé med variantbeløp 100, 500 og 1 000 kr.",
        "Go, ReAI! shows one product idea with variant amounts of 100, 500 and 1,000 kr.",
      ],
      [
        "Kontormagi er en manuelt valgt, ordnet samling. Alle demo-objekter er en automatisk samling basert på merket ReAI Demo.",
        "Office magic is a manually selected, ordered collection. All demo objects is an automated collection based on the ReAI Demo brand.",
      ],
      [
        "Bilder, metadata og responsive renditions leveres fra ReAI. Fiktive produktillustrasjoner er originalkunst.",
        "Images, metadata and responsive renditions are delivered by ReAI. Fictional product illustrations are original art.",
      ],
      [
        "Produktsiden henter fersk tilgjengelighet. Checkout validerer igjen før betaling.",
        "The product page fetches fresh availability. Checkout validates again before payment.",
      ],
    ],
    sections: [
      {
        title: ["Snapshot eller ett produkt?", "Snapshot or one product?"],
        text: [
          "storefront gir produkter og samlingsmedlemskap fra ett sammenhengende snapshot med catalogVersion. catalog gir hele produktkatalogen; products gir produktlisten. collection gir ordnede, lette produktreferanser. product gir detaljer for én handle. Bruk snapshotet på butikksider og detaljkallet der du trenger det.",
          "storefront returns products and collection membership from one coherent snapshot with catalogVersion. catalog returns the product catalog; products returns the product list. collection gives ordered, lightweight product references. product returns detail for one handle. Use the snapshot for storefront pages and detail calls where needed.",
        ],
      },
      {
        title: [
          "Lager uten å lekke lageret",
          "Availability without exposing the warehouse",
        ],
        text: [
          "Tilgjengelighet leveres som en grov status, ikke interne lagertall. Batch-kallet sjekker opptil 100 publiserte varianter. En handlekurv i nettleseren reserverer ingenting. Sesjonsopprettelse validerer; betalingsstart reserverer lager når varen krever det. Våre digitale demo-produkter er ikke lagerstyrt.",
          "Availability is delivered as a coarse status, not internal stock counts. The batch operation checks up to 100 published variants. A browser cart reserves nothing. Session creation validates; payment initiation reserves inventory when the item requires it. Our digital demo products are not stock-managed.",
        ],
      },
      {
        title: [
          "Pakkeprodukter deler komponentlager",
          "Bundles share component inventory",
        ],
        text: [
          "Site API kan levere bundle.items med komponenttittel, variantvalg, SKU og antall per pakke. Pakken har egen pris og SKU; checkout får pakkens variant-ID og antall, ikke oppsplittede komponenter. ReAI validerer felles komponentbehov i hele kurven. Denne digitale katalogen har ingen lagerpakker; dette er en støttet funksjon forklart med kontrakten.",
          "The Site API can deliver bundle.items with component title, variant options, SKU and quantity per bundle. The bundle has its own price and SKU; checkout receives its variant ID and count, not expanded components. ReAI validates shared component demand across the cart. This digital catalog has no inventory bundles; this is a supported feature explained through the contract.",
        ],
      },
    ],
    links: [
      [
        "/collections/alle-demo-objekter/",
        ["Åpne automatisk samling", "Open automated collection"],
      ],
      ["/products/heia-reai/", ["Prøv varianter", "Try variants"]],
    ],
    code: "GET /site/v1/commerce/storefront?market=default&locale=en\nGET /site/v1/commerce/products/heia-reai?market=default&locale=en\nGET /site/v1/commerce/availability?variantId=<UUID>&variantId=<UUID>\n\n# Public IDs only. No cost, margin or warehouse counts.",
    codeLabel: [
      "Leveringsdata er Site-avgrenset. Hemmelige forretningsdata blir i ReAI.",
      "Delivery data is Site-scoped. Private business data stays in ReAI.",
    ],
  },
  {
    slug: "markets",
    shortTitle: ["Marked", "Markets"],
    icon: "NO / EN",
    tag: ["PRØV SPRÅKKNAPPEN", "TRY THE LANGUAGE BUTTON"],
    title: ["Samme butikk. Riktig kontekst.", "Same store. Right context."],
    summary: [
      "Marked velger valuta og prisliste. Språk velger oversettelse. De gjør ulike jobber.",
      "Market selects currency and price list. Locale selects translation. They do different jobs.",
    ],
    intro: [
      "Bytt mellom norsk og engelsk her. Designet er det samme; publiserte produkt- og samlingstekster leveres i riktig språk.",
      "Switch between Norwegian and English here. The design stays the same; published product and collection copy is delivered in the selected language.",
    ],
    steps: [
      [
        "site gir tilgjengelige markeder, land, valuta og språk.",
        "site lists available markets, countries, currencies and locales.",
      ],
      [
        "Worker velger default-markedet og et støttet språk fra kundens språkvalg.",
        "The Worker selects the default market and a supported locale from the shopper’s language selection.",
      ],
      [
        "Alle produktkall og checkout bruker samme market og locale.",
        "All product requests and checkout use the same market and locale.",
      ],
      [
        "Dette markedet er Norge med NOK, nb-NO og en. Engelsk oversetter teksten; det konverterer ikke valuta.",
        "This market is Norway with NOK, nb-NO and en. English changes the copy; it does not convert currency.",
      ],
    ],
    sections: [
      {
        title: [
          "Prisliste, land og oversettelser",
          "Price list, country and translations",
        ],
        text: [
          "Et marked kobler nettstedet til en prisliste, valuta, land og støttede språk. Produkt- og samlingsoversettelser vedlikeholdes i ReAI. Statisk læringsinnhold vedlikeholdes i Git. Et språkvalg oppretter ikke automatisk et nytt internasjonalt leveringsmarked.",
          "A market connects the Site to a price list, currency, countries and supported locales. Product and collection translations are maintained in ReAI. Static learning content is maintained in Git. A language selection does not automatically create a new international shipping market.",
        ],
      },
      {
        title: [
          "Beløpet i API-et er allerede klart for visning",
          "The API amount is already ready to display",
        ],
        text: [
          "Leveringsprisen brukes direkte og formateres i markedets valuta. Frontend legger ikke på mva. en gang til. Tenantens avgiftsoppsett og prisliste eies av ReAI; operatøren må velge godkjent avgiftskode og bevare de ønskede visningsbeløpene.",
          "The delivery price is used directly and formatted in the market currency. The frontend does not add VAT a second time. ReAI owns the tenant’s tax setup and price list; the operator must select the approved tax code and preserve the intended display amounts.",
        ],
      },
    ],
    links: [
      ["/shop/?lang=en", ["Se butikken på engelsk", "See the shop in English"]],
      ["/api/?endpoint=site", ["Se markedskontekst", "Inspect market context"]],
    ],
    code: "GET /site/v1/site\nGET /site/v1/commerce/catalog?market=default&locale=nb-NO\nGET /site/v1/commerce/catalog?market=default&locale=en\n\n# Locale changes text. Market determines commerce context.",
    codeLabel: [
      "Demoen har ett marked og to språk — ikke automatisk valutakonvertering.",
      "The demo has one market and two locales — no automatic currency conversion.",
    ],
  },
  {
    slug: "integration",
    shortTitle: ["Integrasjon", "Integration"],
    icon: "{ }",
    tag: ["FRA NETTSIDE TIL PLATTFORM", "FROM WEBSITE TO PLATFORM"],
    title: [
      "Design fritt. Hold dataene samlet.",
      "Design freely. Keep data together.",
    ],
    summary: [
      "Statisk nettsted, Site API, management-API og ordre/regnskap. Hvem gjør hva?",
      "Static website, Site API, management API and orders/accounting. Who does what?",
    ],
    intro: [
      "ReAI er både datakilde og handelsplattform. Nettsiden kan være helt selvstendig, med sitt eget repo og sin egen deploy.",
      "ReAI is both a data source and commerce platform. The website can stay independent, with its own repository and deployment.",
    ],
    steps: [
      [
        "Git eier design, navigasjon og forklaringer. Et rent statisk nettsted trenger ingen commerce-integrasjon.",
        "Git owns design, navigation and explanations. A purely static website needs no commerce integration.",
      ],
      [
        "Management-API-et lar en autorisert operatør vedlikeholde Site, produkter, publisering og handelsregler.",
        "The management API lets an authorized operator manage the Site, products, publication and commerce rules.",
      ],
      [
        "Site API leverer bare denne Sitens publiserte data til Worker. Site-nøkkelen er separat fra brukerens management-nøkkel.",
        "The Site API delivers only this Site’s published data to the Worker. Its credential is separate from a user’s management credential.",
      ],
      [
        "ReAI checkout håndterer kontakt, levering og betalingsstatus. Ordre, faktura og regnskapsoppfølging blir i plattformen.",
        "ReAI checkout handles contact, delivery and payment status. Orders, invoices and accounting follow-up stay in the platform.",
      ],
    ],
    sections: [
      {
        title: [
          "Uavhengig nettsted, felles forretningsdata",
          "Independent website, shared business data",
        ],
        text: [
          "En designendring deployer bare dette nettstedet. Produkt- og prisendringer gjøres i ReAI. En feil i katalogkallet vises som en feil; produksjon bruker aldri en lokal reservekatalog som later som den er live.",
          "A design change deploys only this website. Product and price changes happen in ReAI. A catalog failure is shown as a failure; production never substitutes a local catalog that pretends to be live.",
        ],
      },
      {
        title: ["Kassasystem i samme plattform", "Point of sale in the same platform"],
        text: [
          "ReAI samler nettbutikk, kassasystem og regnskap. Salg i fysisk butikk håndteres i kassasystemet, med kvitteringer, betalinger og regnskapsoppfølging i ReAI. Du trenger ikke en dyr integrasjon mellom et separat kassasystem og regnskapssystem. Site API-et på dette nettstedet er for nettbutikken; kassasystemet brukes i ReAI.",
          "ReAI brings together online commerce, point of sale and accounting. In-store sales are handled by the point of sale, with receipts, payments and accounting follow-up in ReAI. You do not need an expensive integration between separate point-of-sale and accounting systems. The Site API on this website serves the storefront; point of sale is used in ReAI.",
        ],
      },
      {
        title: [
          "Hva Site API ikke skal gi nettleseren",
          "What the Site API must not give the browser",
        ],
        text: [
          "Intern tenant-ID, kostpris, margin, lagerbeholdning, bank- og regnskapsdata hører ikke hjemme i offentlige leveringsdata. Management-API-et har bredere funksjoner og krever bruker-/tenant-tilgang. API-lekeplassen her viser bare Site-leveringsdata.",
          "Internal tenant IDs, costs, margins, warehouse counts, bank and accounting data do not belong in public delivery data. The management API has wider capabilities and requires user/tenant access. This playground shows only Site delivery data.",
        ],
      },
      {
        title: ["Fra betaling til oppfølging", "From payment to follow-up"],
        text: [
          "En opprettet checkout er ikke en betalt ordre. ReAI håndterer betalingsutfall og videre ordre-/fakturaflyt; bruk plattformens status før levering. Faktura, innbetaling og oppgjør er ulike steg. Adyen-gebyrer og avstemming skal ikke behandles som om en retur-URL automatisk bokførte alt.",
          "A created checkout is not a paid order. ReAI handles payment outcomes and subsequent order/invoice flow; use platform status before fulfillment. Invoice, payment and settlement are different steps. Adyen fees and reconciliation must not be treated as if a return URL automatically posted everything.",
        ],
      },
      {
        title: [
          "Ett privat repo per kunde",
          "One private repository per client",
        ],
        text: [
          "Hver kundes nettsted har egne rettigheter, instruksjoner og deploy. Det interne customer-sites-repoet organiserer dem som submoduler og lagrer bare valgte commit-referanser. Å pushe i et barnerepo deployer ikke naboens nettsted eller endrer automatisk forelderens pin.",
          "Each client website has its own permissions, instructions and deployment. The internal customer-sites repository organizes them as submodules and stores selected commit references. Pushing a child repository neither deploys a neighbor’s site nor automatically changes the parent’s pin.",
        ],
      },
    ],
    links: [
      [
        "/api/",
        ["Utforsk alle leveringskall", "Explore every delivery operation"],
      ],
      [
        "https://github.com/beint-no/reai-site-examples",
        ["Kode og oppsett", "Source and setup"],
      ],
    ],
    code: "Browser → demo Worker → /site/v1/** (Site credential)\nOperator → /api/** + X-Tenant-Id (management credential)\nBrowser → ReAI hosted checkout → Adyen\nReAI → payment status / order / invoice follow-up",
    codeLabel: [
      "To API-grenser, én forretningsplattform.",
      "Two API boundaries, one business platform.",
    ],
  },
];

// Complete operation coverage of the current delivery contract; management is separate.
export const operations = [
  [
    "site",
    "GET",
    "/site/v1/site",
    ["Identitet, marked og språk", "Identity, markets and locales"],
  ],
  [
    "storefront",
    "GET",
    "/site/v1/commerce/storefront",
    [
      "Sammenhengende snapshot til butikksider",
      "Coherent snapshot for storefront pages",
    ],
  ],
  [
    "catalog",
    "GET",
    "/site/v1/commerce/catalog",
    ["Publisert katalog og priser", "Published catalog and prices"],
  ],
  [
    "products",
    "GET",
    "/site/v1/commerce/products",
    ["Publisert produktliste", "Published product list"],
  ],
  [
    "product",
    "GET",
    "/site/v1/commerce/products/{handle}",
    [
      "Detaljer, bilder, varianter og eventuelle pakker",
      "Details, images, variants and optional bundles",
    ],
  ],
  [
    "collections",
    "GET",
    "/site/v1/commerce/collections",
    ["Publiserte samlinger", "Published collections"],
  ],
  [
    "collection",
    "GET",
    "/site/v1/commerce/collections/{handle}",
    ["Ordnet medlemskap i én samling", "Ordered membership of one collection"],
  ],
  [
    "availability",
    "GET",
    "/site/v1/commerce/availability/{variantId}",
    [
      "Grov tilgjengelighet for én variant",
      "Coarse availability for one variant",
    ],
  ],
  [
    "availabilities",
    "GET",
    "/site/v1/commerce/availability",
    [
      "Grov tilgjengelighet for opptil 100 varianter",
      "Coarse availability for up to 100 variants",
    ],
  ],
  [
    "newsletter",
    "POST",
    "/site/v1/newsletter/subscriptions",
    [
      "E-postpåmelding med eksplisitt samtykke",
      "Email signup with explicit consent",
    ],
  ],
  [
    "checkout",
    "POST",
    "/site/v1/commerce/checkout-sessions",
    [
      "Start via kurven; ikke et lesekall",
      "Start through the cart; not a read operation",
    ],
  ],
];
