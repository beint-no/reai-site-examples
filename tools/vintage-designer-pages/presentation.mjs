// Presentation-only profile for the explicitly approved, separately hosted demo.
// The normal Site API Worker and its fixture-deployment guard are unchanged.
export function presentation(html, origin) {
  return html
    .replace(/<div class="preview-bar">[\s\S]*?<\/div>/g,'')
    .replace(/<div class="editorial-note">[\s\S]*?<\/div>/g,'')
    .replace(/<p class="(?:preview-note|review-context)">[\s\S]*?<\/p>/g,'')
    .replace(/<p>Ingen bestillinger eller betalinger<br>behandles i denne forhåndsvisningen\.<\/p>/g,'')
    .replace(/<p>Prisene sjekkes på nytt når handlekurven åpnes\.<\/p>/g,'')
    .replace(/<p>Dette er en forhåndsvisning\. Ingen betalinger eller bestillinger behandles\.<\/p>/g,'')
    .replace(/<button class="button" type="button" disabled>Kjøp er ikke aktivert<\/button>/g,'<button class="button" type="button" data-unavailable-checkout>Gå til kassen</button>')
    .replace(/>([^<>]+)</g, (_,text)=>'>'+text
      .replace(/Denne forhåndsvisningen viser et kort sammendrag; /g,'')
      .replace(/Denne forhåndsvisningen[^.!?]*[.!?]/gi,'')
      .replace(/Dette er en forhåndsvisning\./gi,'')
      .replace(/Forhåndsvisningen har ingen kundekonto, nyhetsbrevpåmelding eller betalingsløsning\./g,'')
      .replace(/Kjøp er ikke aktivert i denne forhåndsvisningen\./g,'')
      .replace(/Ingen frakt eller bestilling beregnes i denne forhåndsvisningen\./g,'')
      .replace(/; denne forhåndsvisningen utsteder ingen sertifikater\./g,'.')
      .replace(/En forhåndsvisning av et nytt butikkvindu/g,'Vintage Designer AS')
      .replace(/Forhåndsvisning/g,'Informasjon')
      .replace(/Kjøp og betaling er ikke aktivert her\./g,'Bestilling og betaling er ikke tilgjengelig. Ta kontakt med butikken hvis du trenger hjelp.')
      .replace(/Kjøp er ikke aktivert/g,'Bestilling er ikke tilgjengelig')
      .replace(/Frakt, retur og betalingsvilkår må bekreftes før denne løsningen åpnes for bestillinger\./g,'')
      .replace(/På dagens nettsted deler kunder/g,'Kunder deler')
      .replace(/på dagens nettsted/g,'hos Vintage Designer')
      .replace(/på det nåværende nettstedet/g,'hos Vintage Designer')+'<')
    .replaceAll('https://vintage-designer.respiro.workers.dev',origin)
    .replaceAll('/__local-media/','/media/');
}
