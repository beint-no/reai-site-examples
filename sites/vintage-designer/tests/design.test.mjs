import test from 'node:test';
import assert from 'node:assert/strict';
import {homeContent,productFacts,authenticationContent,readableDescription} from '../design.mjs';
import {renderProductPage,renderSitemap,renderStaticPage} from '../storefront.mjs';
test('model switcher and source discovery survive the redesign',()=>{
 const products=['Speedy','Keepall'].map((title,i)=>({title,handle:title.toLowerCase(),brand:'Test',images:[{url:'/synthetic.png',width:400,height:400}],variants:[]}));
 const html=homeContent({products});
 assert.match(html,/data-model-tab="keepall"/);
 assert.match(html,/data-model-panel="keepall" hidden/);
 for(const path of ['alle-handvesker','reisevesker','var-autentisering','kundeomtaler'])assert.ok(html.includes(path));
});
test('details are extracted only from explicit source facts',()=>{
 assert.deepEqual(productFacts('En fin veske fra et historisk merke.'),[]);
 const facts=Object.fromEntries(productFacts('Tilstand: God stand Vesken er hel. Produksjonskode: AB1234 Mål ca. 32 cm × 20 cm.\nMedfølger: Dustbag, Ektehetsbevis'));
 assert.equal(facts.Tilstand,'God stand');assert.equal(facts.Produksjonskode,'AB1234');assert.equal(facts.Medfølger,'Dustbag, Ektehetsbevis');
 assert.equal(facts.Mål,'32 cm × 20 cm');
});
test('brand discovery counts current products and encodes filter links',()=>{
 const html=homeContent({products:[{title:'One',brand:'A & B',images:[]},{title:'Two',brand:'A & B',images:[]},{title:'Three',brand:'Dior',images:[]}]});
 assert.match(html,/brand=A%20%26%20B/);assert.match(html,/A &amp; B/);
 assert.match(html,/2 vesker i utvalget/);assert.match(html,/1 veske i utvalget/);
});
test('flat product descriptions gain paragraphs without changing source words',()=>{
 const source='En vintageveske. Tilstand: God stand. Yttermateriale: Skinn. Innside: Ren. Detaljer:Produksjonskode: AB12';
 const formatted=readableDescription(source);
 assert.match(formatted,/\nTilstand:/);assert.match(formatted,/\nYttermateriale:/);
 assert.equal(formatted.replace(/\s/g,''),source.replace(/\s/g,''));
});
test('full gallery, verification and condition guide are reachable',()=>{
 const html=renderProductPage({}, {title:'Test',handle:'test',variants:[],images:[{url:'/test.png',width:600,height:600},{url:'/detail.png',width:600,height:600}]});
 assert.match(html,/2 bilder av denne vesken/);assert.match(html,/data-zoom/);assert.match(html,/Vis bilde 2 av 2/);
 assert.match(authenticationContent(),/https:\/\/certificates.legitgrails.com\//);
 assert.match(renderStaticPage('/pages/tilstandsguide/'),/tilstandsskala/);
 assert.match(renderSitemap({}),/pages\/tilstandsguide/);
});
