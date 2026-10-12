import { decisionProducts, accessories, decisionTotals, fitsNeed } from './product-lab-model.js';
import { productDelivery, deliveryThreshold } from './product-delivery-model.js';
const root=document.querySelector('[data-product-lab]');
if(root){
  const en=document.documentElement.lang==='en',p=(a,b)=>en?b:a, pick=pair=>pair[en?1:0];
  const find=selector=>root.querySelector(selector), money=n=>new Intl.NumberFormat(en?'en-GB':'nb-NO',{style:'currency',currency:'NOK'}).format(n);
  let selected='home',need='desk',lines=[],appliedCode='',destination='oslo',method='shipping';
  const set=(selector,text)=>find(selector).textContent=text;
  function product(){
    const item=decisionProducts.find(v=>v.id===selected),accessory=accessories.find(v=>v.id===item.accessory);
    root.querySelectorAll('[data-product-select]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.productSelect===selected)));
    root.querySelectorAll('[data-decision-card]').forEach(card=>card.querySelector('[data-suitability]').textContent=fitsNeed(card.dataset.decisionCard,need)?p('Passer valgt bruksbehov.','Fits the selected use case.'):p('Passer ikke i veske: åpen topp.','Unsuitable for a bag: open top.'));
    set('[data-decision-title]',pick(item.name));set('[data-decision-use]',pick(item.use));set('[data-decision-volume]',item.capacity+' ml');set('[data-decision-material]',pick(item.material));set('[data-decision-care]',pick(item.care));set('[data-decision-limitation]',pick(item.limitation));
    set('[data-accessory-reason]',pick(accessory.reason));set('[data-accessory-add]',p('Legg til ','Add ')+pick(accessory.name)+' · '+money(accessory.price));
    delivery();
  }
  function delivery() {
    const current=productDelivery(lines,appliedCode,destination,method);
    const changed=current.selectedMethod!==method;
    method=current.selectedMethod;
    find('[data-delivery-method]').value=method;
    find('[data-delivery-method] option[value=pickup]').disabled=!current.pickupAvailable;
    set('[data-delivery-location]',current.pickupAvailable?p('Henting: fiktivt lab-hentested, Eksempelgate 1, Oslo. Ingen reservasjon.','Pickup: fictional lab point, Example Street 1, Oslo. No reservation.'):p('Henting er ikke tilgjengelig for dette eksempelområdet.','Pickup is unavailable for this example region.'));
    const preview=productDelivery([{id:selected,quantity:1}],appliedCode,destination,method);
    set('[data-delivery-preview]',preview.covered?p('Valgt kopp alene: ','Selected mug alone: ')+money(preview.merchandise)+p(' + frakt ',' + delivery ')+money(preview.shipping)+p(' = estimert total ',' = estimated total ')+money(preview.total)+'.':p('Dette området er utenfor labens leveringsdekning. Frakt og total er ukjent; det betyr ikke gratis levering.','This region is outside lab delivery coverage. Delivery and total are unknown; that does not mean free shipping.'));
    set('[data-delivery-change]',changed?p('Henting ble utilgjengelig. Valget er endret til sending; se det oppdaterte estimatet.','Pickup became unavailable. Selection changed to shipping; check the updated estimate.'):'');
    set('[data-decision-shipping]',!current.hasItems?'—':current.shipping===null?p('Ukjent','Unknown'):money(current.shipping));
    set('[data-decision-total]',current.total===null?p('Ukjent','Unknown'):money(current.total));
    set('[data-delivery-threshold]',!current.hasItems?p('Legg til en vare for å se kurvens fraktestimat.','Add an item to see the basket delivery estimate.'):!current.covered?p('Ingen leveringsmetode i dette eksempelområdet. Varebeløpet vises, men en total kan ikke beregnes.','No delivery method in this example region. Merchandise cost is shown, but a total cannot be calculated.'):method==='pickup'?p('Henting koster 0 kr. Fri-frakt-grensen gjelder sending.','Pickup costs 0 kr. The free-delivery threshold applies to shipping.'):current.qualifies?p('Kurven kvalifiserer til fri standardfrakt etter rabatt.','The basket qualifies for free standard delivery after discount.'):p('Standardfrakt er 49 kr. Det mangler ','Standard delivery costs 49 kr. Another ')+money(current.remaining)+p(' i varer etter rabatt til grensen på ',' in merchandise after discount reaches the ')+money(deliveryThreshold)+p('. Du kan beholde kurven som den er.','. You can keep the basket as it is.'));
  }
  function reviews(){set('[data-review-status]',find('[data-review-mode]').value==='fixture'?p('Fiktivt tallsett: 4,2 av 5 · 12 vurderinger. Bare en visningstest.','Fictional scores: 4.2 of 5 · 12 reviews. Display test only.'):p('Ingen vurderinger samlet. Bruk produktfakta og vilkår til å vurdere koppen.','No reviews collected. Use product facts and policies to evaluate the mug.'));}
  function basket(renderLines=true){
    const totals=decisionTotals(lines,appliedCode),container=find('[data-decision-lines]');
    // Promo blur must not replace a remove button between pointerdown and click.
    if(renderLines){container.replaceChildren();
    if(!lines.length){const empty=document.createElement('p');empty.textContent=p('Testkurven er tom.','The test basket is empty.');container.append(empty);}
    for(const line of lines){const item=[...decisionProducts,...accessories].find(p=>p.id===line.id),row=document.createElement('div'),text=document.createElement('p'),remove=document.createElement('button');text.textContent=pick(item.name)+' × '+line.quantity+' · '+money(item.price*line.quantity);remove.type='button';remove.textContent=p('Fjern ','Remove ')+pick(item.name);remove.addEventListener('click',()=>{lines=lines.filter(l=>l.id!==line.id);basket();set('[data-decision-status]',p('Fjernet fra testkurven.','Removed from test basket.'));});row.append(text,remove);container.append(row);}}
    set('[data-decision-subtotal]',money(totals.subtotal));set('[data-decision-discount]',totals.discount?'-'+money(totals.discount):money(0));
    delivery();
    const status=find('[data-promo-status]');status.textContent=totals.codeState==='invalid'?p('Ukjent labkode. Prøv LAB10; ingen rabatt er lagt til.','Unknown lab code. Try LAB10; no discount was applied.'):totals.codeState==='valid'?p('LAB10 brukt: 10 % på kopper. Tilbehør er unntatt.','LAB10 applied: 10% on mugs. Accessories excluded.'):'';
    find('[data-decision-code]').setAttribute('aria-invalid',String(totals.codeState==='invalid'));
  }
  function add(id){const line=lines.find(l=>l.id===id);if(line&&line.quantity>=20){set('[data-decision-status]',p('Maks 20 av hver vare i denne laben.','Maximum 20 of each item in this lab.'));return;}if(line)line.quantity++;else lines.push({id,quantity:1});basket();set('[data-decision-status]',p('Lagt i testkurven. Ingen ekte ordre opprettes.','Added to test basket. No real order is created.'));}
  root.querySelectorAll('[data-product-select]').forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.productSelect;product();find('[data-decision-title]').focus({preventScroll:true});find('[data-decision-title]').scrollIntoView({block:'start'});}));
  root.querySelectorAll('[name=need]').forEach(input=>input.addEventListener('change',()=>{need=input.value;product();}));
  find('[data-decision-add]').addEventListener('click',()=>add(selected));find('[data-accessory-add]').addEventListener('click',()=>add(decisionProducts.find(p=>p.id===selected).accessory));
  find('[data-review-mode]').addEventListener('change',reviews);
  find('[data-delivery-destination]').addEventListener('change',event=>{destination=event.target.value;delivery();});
  find('[data-delivery-method]').addEventListener('change',event=>{method=event.target.value;delivery();});
  const code=find('[data-decision-code]'), apply=()=>{appliedCode=code.value;basket(false);};code.addEventListener('blur',apply);code.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();apply();}});
  find('[data-decision-code-clear]').addEventListener('click',()=>{code.value='';appliedCode='';basket(false);code.focus();});
  find('[data-decision-reset]').addEventListener('click',()=>{selected='home';need='desk';lines=[];appliedCode='';destination='oslo';method='shipping';find('[data-delivery-destination]').value=destination;code.value='';find('[name=need][value=desk]').checked=true;find('[data-review-mode]').value='none';find('[data-promo-disclosure]').open=false;set('[data-decision-status]',p('Laben er tilbakestilt.','Lab reset.'));product();reviews();basket();});
  product();reviews();basket();
}
