import { defineLocaleCatalog } from "../../../packages/reai-cloudflare-storefront/locale-routing.mjs";

export default defineLocaleCatalog("nb-NO", {
  worker: {
    invalidJson: "Ugyldig JSON.",
    invalidLineCount: "Handlekurven må inneholde mellom 1 og 100 linjer.",
    invalidLine: "Handlekurven inneholder en ugyldig variant eller et ugyldig antall.",
    notConfigured: "Site API er ikke konfigurert.",
    invalidProductHandle: "Ugyldig produkthåndtak.",
    invalidCollectionHandle: "Ugyldig samlingshåndtak.",
    invalidVariantId: "Ugyldig variant-ID.",
    routeNotFound: "Fant ikke API-ruten.",
    methodNotAllowed: "Metoden er ikke tillatt.",
    temporarilyUnavailable: "Site API er midlertidig utilgjengelig.",
  },
  site: {
    homeLink: "Til forsiden",
    languageNavigation: "Språk",
    notFoundTitle: "Fant ikke siden | Endorphin",
    notFoundHeading: "Her var det tomt.",
    notFoundText: "Siden finnes ikke, eller har fått en ny adresse.",
    unavailableTitle: "Midlertidig utilgjengelig | Endorphin",
    unavailableHeading: "Utvalget er nede.",
    unavailableText: "Vi får ikke hentet produkter akkurat nå. Prøv igjen om litt.",
  },
});
