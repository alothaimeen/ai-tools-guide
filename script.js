const tools = [
  {id:1,name:'Replit',category:'بناء ويب',price:20,ai:true},
  {id:2,name:'TeleportHQ',category:'بناء ويب',price:18,ai:true},
  {id:3,name:'Builder.io',category:'بناء ويب',price:19,ai:true},
  {id:4,name:'AppyPie',category:'تطبيقات',price:16,ai:false},
  {id:5,name:'Adalo',category:'تطبيقات',price:45,ai:false},
  {id:6,name:'Make',category:'أتمتة',price:10.59,ai:false},
  {id:7,name:'Zapier',category:'أتمتة',price:19.99,ai:false}
];
let favorites = JSON.parse(localStorage.getItem('favorites')||'[]');
let ratings = JSON.parse(localStorage.getItem('ratings')||'{}');
let compareList = [];

const toolsList = document.getElementById('toolsList');
const searchInput = document.getElementById('search');
const toggleDark = document.getElementById('toggleDark');
const compareBtn = document.getElementById('compareBtn');
const modal = document.getElementById('compareModal');
const closeBtn = modal.querySelector('.close');
const compareTableBody = document.querySelector('#compareTable tbody');

function renderTools(){
  toolsList.innerHTML='';
  const term = searchInput.value.trim().toLowerCase();
  tools.filter(t=>t.name.toLowerCase().includes(term)).forEach(t=>{
    const div = document.createElement('div');
    div.className='tool-card';
    div.innerHTML=\`
      <h3>\${t.name}</h3>
      <p>الفئة: \${t.category}</p>
      <p>السعر: $\${t.price}</p>
      <p>الذكاء الاصطناعي: \${t.ai?'نعم':'لا'}</p>
      <div>
        ⭐ <span class="star" data-id="\${t.id}">\${ratings[t.id]||'0'}</span>
        ❤️ <span class="favorite" data-id="\${t.id}">\${favorites.includes(t.id)?'💖':'🤍'}</span>
        📤 <a href="https://twitter.com/intent/tweet?text=\${encodeURIComponent('جرب '+t.name+' من دون كود!')}" target="_blank">Share</a>
        <input type="checkbox" class="compare" data-id="\${t.id}">قارن
      </div>\`;
    toolsList.appendChild(div);
  });
  attachEvents();
}

function attachEvents(){
  document.querySelectorAll('.favorite').forEach(el=>{
    el.onclick = ()=>{
      const id=+el.dataset.id;
      favorites.includes(id) ? favorites = favorites.filter(n=>n!==id) : favorites.push(id);
      localStorage.setItem('favorites',JSON.stringify(favorites));
      renderTools();
    };
  });
  document.querySelectorAll('.star').forEach(el=>{
    el.onclick = ()=>{
      const id=+el.dataset.id;
      let r = prompt('قيم الأداة من 1 إلى 5:',ratings[id]||'');
      if(r>=1 && r<=5){ratings[id]=r;localStorage.setItem('ratings',JSON.stringify(ratings));renderTools();}
    };
  });
  document.querySelectorAll('.compare').forEach(el=>{
    el.onchange = ()=>{
      const id=+el.dataset.id;
      el.checked ? compareList.push(id) : compareList = compareList.filter(n=>n!==id);
      compareBtn.disabled = compareList.length<2;
    };
  });
}

compareBtn.onclick = ()=>{
  compareTableBody.innerHTML='';
  compareList.forEach(id=>{
    const t = tools.find(o=>o.id===id);
    compareTableBody.innerHTML += \`<tr>
      <td>\${t.name}</td>
      <td>$\${t.price}</td>
      <td>\${t.category}</td>
      <td>\${ratings[id]||'–'}</td>
    </tr>\`;
  });
  modal.style.display='flex';
};
closeBtn.onclick = ()=> modal.style.display='none';
window.onclick = e=>{ if(e.target===modal) modal.style.display='none'; };
searchInput.oninput = renderTools;

toggleDark.onclick = ()=>{
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode',document.body.classList.contains('dark-mode'));
};

window.addEventListener('DOMContentLoaded',()=>{
  if(JSON.parse(localStorage.getItem('darkMode'))) document.body.classList.add('dark-mode');
  renderTools();
});
