const root = document.querySelector('[data-ux-test-plan]');
if(root) {
  const topics=[...root.querySelectorAll('[data-test-topic]')], count=root.querySelector('[data-test-count]');
  function refresh() { const visible=topics.filter(t=>!t.hidden); const checks=visible.flatMap(t=>[...t.querySelectorAll('input[type=checkbox]')]); count.textContent=`${checks.filter(c=>c.checked).length} / ${checks.length}`; }
  root.addEventListener('change',refresh);
  root.querySelector('[data-test-stage]').addEventListener('change',(e)=>{ topics.forEach(t=>t.hidden=e.target.value!=='all'&&t.dataset.testTopic!==e.target.value); refresh(); });
  root.querySelector('[data-test-print]').addEventListener('click',()=>window.print());
  root.querySelector('[data-test-reset]').addEventListener('click',()=>{ root.querySelectorAll('input[type=checkbox]').forEach(c=>c.checked=false); refresh(); });
  refresh();
}
