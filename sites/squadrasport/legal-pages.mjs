const email = '<a href="mailto:info@squadrasport.no">info@squadrasport.no</a>';

const policyPage = (label, title, introduction, sections) => `<article class="policy-page"><header class="page-heading"><div class="content-width"><p class="eyebrow">${label}</p><h1>${title}</h1><p>${introduction}</p></div></header><div class="content-width policy-content">${sections}</div></article>`;

export const legalPages = {
  privacy: {
    title: "Personvern",
    path: "/policies/privacy-policy",
    description: "Hvordan Squadra Sport behandler opplysninger i nettbutikken.",
    body: policyPage("Informasjon", "Personvern", "Her kan du lese hva som skjer med opplysningene dine når du besøker nettbutikken, handler eller kontakter oss.", `
      <section><h2>Hvem er ansvarlig?</h2><p>Squadra Sport AS, organisasjonsnummer 936 175 260, er behandlingsansvarlig for opplysninger om kunder i nettbutikken. Selskapets registrerte adresse er Per Waalers vei 24, 1360 Fornebu. Kontakt oss på ${email} eller telefon <a href="tel:+4799003500">9900 3500</a> hvis du har spørsmål om personvern.</p></section>
      <section><h2>Hvilke opplysninger brukes?</h2><ul><li>Når du besøker nettstedet, behandles tekniske opplysninger som IP-adresse og informasjon om forespørselen for å levere og beskytte siden.</li><li>Handlekurven lagres lokalt i nettleseren din. Den inneholder valgte produkter, varianter, antall og pris, og sendes først til kassen når du velger å gå videre.</li><li>Ved bestilling oppgir du kontakt- og leveringsopplysninger. Vi behandler også ordren, valgt fraktmetode og betalingsstatus for å gjennomføre kjøpet.</li><li>Hvis du tar kontakt, behandler vi opplysningene du sender for å svare på henvendelsen og følge opp bestillingen.</li></ul></section>
      <section><h2>Hvorfor behandler vi opplysningene?</h2><p>Kontakt-, ordre- og leveringsopplysninger brukes for å oppfylle kjøpsavtalen. Regnskapsopplysninger beholdes for å oppfylle lovpålagte bokføringskrav. Teknisk informasjon brukes for å holde nettstedet tilgjengelig og sikkert. Denne nettbutikken har ikke skjema for nyhetsbrev eller egen markedsføringssporing.</p></section>
      <section><h2>Hvem får opplysningene?</h2><p>Nettstedet leveres gjennom Cloudflare. ReAI håndterer kasse, ordre og ordrebekreftelse. Betalingen behandles gjennom Adyen, og leveringsopplysninger deles med transportøren du velger i kassen, for eksempel Bring eller PostNord.</p></section>
      <section><h2>Hvor lenge lagres opplysningene?</h2><p>Handlekurven blir liggende på enheten din til du tømmer den, fullfører et kjøp eller fjerner nettleserdata. Regnskapsbilag oppbevares som hovedregel i fem år etter regnskapsårets slutt. Andre ordre- og kundeserviceopplysninger beholdes så lenge det er nødvendig for å levere kjøpet, håndtere reklamasjoner og eventuelle rettskrav. Tekniske logger beholdes bare så lenge de trengs for drift og sikkerhet.</p></section>
      <section><h2>Rettighetene dine</h2><p>Du kan be om innsyn i opplysninger om deg og om retting eller sletting når vilkårene for det er oppfylt. Du kan også be om begrensning av behandling og, der reglene gjelder, dataportabilitet eller protestere mot behandling som bygger på en interesseavveining. Skriv til ${email}. Du kan klage til <a href="https://www.datatilsynet.no/">Datatilsynet</a> hvis du mener opplysningene dine behandles i strid med regelverket.</p></section>
    `),
  },
  refund: {
    title: "Retur og angrerett",
    path: "/policies/refund-policy",
    description: "Slik bruker du angreretten eller melder fra om en feil ved en vare.",
    body: policyPage("Kundeservice", "Retur og angrerett", "Her finner du fremgangsmåten hvis du vil angre et kjøp eller melde fra om en feil ved varen.", `
      <section><h2>Angrerett ved nettkjøp</h2><p>Som forbruker har du normalt 14 dagers angrerett fra dagen etter at du mottar varen. Hvis en bestilling leveres i flere deler, løper fristen fra dagen etter at du mottar den siste delen. Gi oss en tydelig melding om at du vil angre innen fristen. Du trenger ikke oppgi noen grunn.</p></section>
      <section><h2>Slik gir du beskjed</h2><p>Send melding til ${email} og oppgi gjerne ordrenummer og hvilke varer det gjelder. Du kan bruke teksten i angreskjemaet nedenfor, men en annen tydelig melding er også gyldig. Ta vare på en kopi av meldingen.</p></section>
      <section><h2>Send varen tilbake</h2><p>Send varen tilbake uten unødig opphold og senest 14 dager etter at du ga beskjed om at du angrer. Kontakt oss for riktig returadresse før du sender pakken. Du betaler den direkte returkostnaden. Du kan undersøke varen slik du ville gjort i en butikk; bruk utover dette kan gi fradrag for redusert verdi.</p></section>
      <section><h2>Tilbakebetaling</h2><p>Vi tilbakebetaler det du har betalt for varen og kostnaden for ordinær levering til deg. Tillegg for en dyrere leveringsmåte du selv valgte, refunderes ikke. Tilbakebetaling skjer uten unødig opphold og senest 14 dager etter at vi mottok meldingen om angrerett. Vi kan holde tilbake beløpet til vi har fått varen tilbake, eller du har vist at den er sendt. Vi bruker samme betalingsmåte som ved kjøpet, med mindre vi avtaler noe annet.</p></section>
      <section><h2>Feil eller skade</h2><p>Hvis varen er skadet, feil eller ikke som avtalt, kontakt ${email} så snart du oppdager det. Dette er en reklamasjon og behandles etter forbrukerkjøpsloven, uavhengig av angreretten. Oppgi ordrenummer og beskriv feilen; legg gjerne ved bilder.</p></section>
      <section class="policy-form"><h2>Valgfritt angreskjema</h2><p>Til Squadra Sport AS, ${email}:</p><p>Jeg gir med dette melding om at jeg ønsker å gå fra avtalen om kjøp av følgende varer: [varer].</p><p>Bestilt: [dato]. Mottatt: [dato]. Navn: [navn]. Adresse: [adresse]. Dato: [dato].</p><p>Signatur er bare nødvendig hvis skjemaet sendes på papir.</p></section>
    `),
  },
  terms: {
    title: "Kjøpsvilkår",
    path: "/pages/terms",
    description: "Vilkår for forbrukerkjøp i Squadra Sports nettbutikk.",
    body: policyPage("Informasjon før kjøp", "Kjøpsvilkår", "Disse vilkårene gjelder forbrukerkjøp av varer i Squadra Sports nettbutikk. Lovfestede rettigheter gjelder alltid.", `
      <section><h2>Selger og kontakt</h2><p>Selger er Squadra Sport AS, organisasjonsnummer 936 175 260, registrert adresse Per Waalers vei 24, 1360 Fornebu. Du kan kontakte oss på ${email} eller telefon <a href="tel:+4799003500">9900 3500</a>.</p></section>
      <section><h2>Produkter og priser</h2><p>Produktets beskrivelse og valgte variant vises før bestilling. Prisene i nettbutikken er oppgitt i norske kroner. Eventuell frakt og samlet beløp vises i kassen før du betaler. Vi bekrefter bestillingen på e-post når den er registrert.</p></section>
      <section><h2>Betaling</h2><p>Betalingen gjennomføres i ReAI-kassen via Adyen. Betalingsmåtene som er tilgjengelige for din bestilling vises i kassen. Kortopplysninger oppgis i betalingsløsningen, ikke i nettbutikkens handlekurv.</p></section>
      <section><h2>Levering</h2><p>Tilgjengelige leveringsmåter, kostnad og leveringsadresse vises i kassen. Frakten utføres av transportøren som velges der. Hvis vi ikke kan levere som avtalt, kontakter vi deg. Rettighetene dine ved forsinket levering følger forbrukerkjøpsloven.</p></section>
      <section><h2>Angrerett og reklamasjon</h2><p>Ved nettkjøp som forbruker har du normalt 14 dagers angrerett. Les hvordan du gir beskjed og returnerer varen på siden om <a href="/policies/refund-policy">retur og angrerett</a>. Hvis varen har en mangel, kan du reklamere etter forbrukerkjøpsloven. Fristen er normalt to år, eller fem år for varer som er ment å vare vesentlig lenger. Gi oss beskjed innen rimelig tid etter at du oppdaget feilen; en melding innen to måneder er alltid i tide.</p></section>
      <section><h2>Personvern og spørsmål</h2><p>Les <a href="/policies/privacy-policy">personvernerklæringen</a> for informasjon om behandling av opplysninger. Kontakt ${email} hvis du har spørsmål om en bestilling eller disse vilkårene.</p></section>
    `),
  },
};
