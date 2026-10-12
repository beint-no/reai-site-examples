const root=document.querySelector('[data-cro-worksheet]');
if(root)root.querySelectorAll('[data-worksheet-field]').forEach(field=>field.addEventListener('input',()=>{root.querySelector('[data-worksheet-output="'+field.dataset.worksheetField+'"]').textContent=field.value;}));
