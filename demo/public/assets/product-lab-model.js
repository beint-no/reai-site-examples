// Original isolated fixtures. These identifiers and prices never enter checkout.
export const decisionProducts = [
  {id:'home',name:['Hjem-kopp','Home mug'],price:120,capacity:350,material:['Keramikk','Ceramic'],leakproof:false,
   use:['En enkel kopp for bordet. Den åpne toppen gjør den lett å drikke fra.','A simple desk mug. An open top makes it easy to drink from.'],
   care:['Tåler oppvaskmaskin i dette fiktive eksemplet.','Dishwasher-safe in this fictional example.'],
   limitation:['Må stå oppreist. Ingen tetning; ikke egnet i en veske.','Keep upright. No seal; unsuitable for a bag.'],accessory:'coaster'},
  {id:'trail',name:['Tur-kopp','Trail mug'],price:240,capacity:500,material:['Rustfritt stål','Stainless steel'],leakproof:true,
   use:['Lukket lokk og større volum for turen. Tetningen krever at lokket er riktig lukket.','A sealed lid and larger capacity for travel. The seal requires a correctly closed lid.'],
   care:['Håndvask kopp og lokk i dette fiktive eksemplet.','Hand-wash mug and lid in this fictional example.'],
   limitation:['Tyngre enn Hjem-kopp. Skal ikke brukes i mikrobølgeovn.','Heavier than the Home mug. Not suitable for microwaves.'],accessory:'strap'},
];
export const accessories = [
  {id:'coaster',name:['Bordunderlag','Coaster'],price:30,reason:['Passer Hjem-kopp: beskytter bordet. Ikke nødvendig for å bruke koppen.','Fits the Home mug: protects the desk. Not required to use the mug.']},
  {id:'strap',name:['Bærestropp','Carrying strap'],price:40,reason:['Passer Tur-koppens feste i denne laben. Ingen påstand om kompatibilitet med andre kopper.','Fits the Trail mug attachment in this lab. No claim of compatibility with other mugs.']},
];
export function decisionTotals(lines,code='') {
  const all=[...decisionProducts,...accessories], quantities=new Map();
  for(const line of lines){if(!all.some(p=>p.id===line.id)||!Number.isInteger(line.quantity)||line.quantity<1)continue;quantities.set(line.id,Math.min(20,(quantities.get(line.id)||0)+line.quantity));}
  let subtotal=0,eligible=0;
  for(const [id,q] of quantities){const item=all.find(p=>p.id===id);subtotal+=item.price*q;if(decisionProducts.some(p=>p.id===id))eligible+=item.price*q;}
  const valid=code.trim().toUpperCase()==='LAB10', discount=valid?Math.round(eligible*10)/100:0;
  return {subtotal,eligible,discount,total:subtotal-discount,codeState:!code.trim()?'empty':valid?'valid':'invalid'};
}
export const fitsNeed = (id,need) => decisionProducts.some(p=>p.id===id)&&(need==='desk'||(need==='bag'&&decisionProducts.find(p=>p.id===id)?.leakproof===true));
