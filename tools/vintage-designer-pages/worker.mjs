// No ReAI credentials, network fetches, checkout sessions or mutable data.
export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    let response;
    if(url.pathname.replace(/\/$/,'')==='/reai/checkout/start') {
      response=Response.json({code:'CHECKOUT_DISABLED',error:'Bestilling og betaling er ikke tilgjengelig. Ta kontakt med butikken hvis du trenger hjelp.'},{status:403});
    } else if(!['GET','HEAD'].includes(request.method)) {
      response=new Response('Metoden er ikke tillatt.',{status:405,headers:{Allow:'GET, HEAD'}});
    } else if(url.pathname==='/reai/catalog') {
      response=await env.ASSETS.fetch(new Request(new URL('/data/catalog.json',url)));
    } else if(/^\/reai\/availability\/[a-zA-Z0-9-]+$/.test(url.pathname)) {
      response=await env.ASSETS.fetch(new Request(new URL('/data/availability/'+url.pathname.split('/').at(-1)+'.json',url)));
    } else if(url.pathname.startsWith('/data/')||url.pathname.startsWith('/reai/')) {
      response=Response.json({error:'Ikke tilgjengelig.'},{status:404});
    } else response=await env.ASSETS.fetch(request);
    const headers=new Headers(response.headers);
    headers.set('X-Robots-Tag','noindex, nofollow');
    headers.set('X-Content-Type-Options','nosniff');
    headers.set('Referrer-Policy','strict-origin-when-cross-origin');
    headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
    headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self' mailto:; base-uri 'self'; frame-ancestors 'none'; object-src 'none'");
    if(url.pathname.startsWith('/reai/')||headers.get('Content-Type')?.includes('text/html'))headers.set('Cache-Control','no-store');
    return new Response(request.method==='HEAD'?null:response.body,{status:response.status,headers});
  }
};
