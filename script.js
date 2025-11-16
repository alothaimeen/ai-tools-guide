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
let currentSort = 'name';
let currentCategory = '';

const toolsList = document.getElementById('toolsList');
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');
const sortBy = document.getElementById('sortBy');
const toggleDark = document.getElementById('toggleDark');
const compareBtn = document.getElementById('compareBtn');
const compareCount = document.getElementById('compareCount');
const exportFavorites = document.getElementById('exportFavorites');
const modal = document.getElementById('compareModal');
const closeBtn = modal.querySelector('.close');
const compareTableBody = document.querySelector('#compareTable tbody');
const clearCompareBtn = document.getElementById('clearCompare');
const toolCount = document.getElementById('toolCount');
const favCount = document.getElementById('favCount');

function getFilteredAndSortedTools() {
  const term = searchInput.value.trim().toLowerCase();
  let filtered = tools.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(term) || 
                         t.category.toLowerCase().includes(term);
    const matchesCategory = !currentCategory || t.category === currentCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort tools
  filtered.sort((a, b) => {
    switch(currentSort) {
      case 'name':
        return a.name.localeCompare(b.name, 'ar');
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return (ratings[b.id] || 0) - (ratings[a.id] || 0);
      default:
        return 0;
    }
  });

  return filtered;
}

function renderTools(){
  toolsList.innerHTML='';
  const filtered = getFilteredAndSortedTools();
  
  if (filtered.length === 0) {
    toolsList.innerHTML = '<p style="text-align: center; padding: 40px; font-size: 1.2rem; color: var(--secondary);">لم يتم العثور على أدوات مطابقة</p>';
    toolCount.textContent = '0';
    return;
  }

  filtered.forEach(t => {
    const div = document.createElement('div');
    div.className = 'tool-card';
    div.setAttribute('role', 'listitem');
    const isCompared = compareList.includes(t.id);
    div.innerHTML = `
      <span class="favorite" data-id="${t.id}" role="button" aria-label="إضافة إلى المفضلة" tabindex="0">
        ${favorites.includes(t.id) ? '💖' : '🤍'}
      </span>
      <h3>${t.name}</h3>
      <p><strong>الفئة:</strong> ${t.category}</p>
      <p><strong>السعر:</strong> $${t.price}</p>
      <p><strong>الذكاء الاصطناعي:</strong> ${t.ai ? '✅ نعم' : '❌ لا'}</p>
      <div class="tool-actions">
        <span style="display: inline-flex; align-items: center; gap: 5px;">
          ⭐ <span class="star" data-id="${t.id}" role="button" aria-label="تقييم الأداة" tabindex="0">${ratings[t.id] || 'غير مقيّم'}</span>
        </span>
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('جرب ' + t.name + ' من دون كود! 🚀')}" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="share-btn"
           aria-label="مشاركة على تويتر">
          📤 مشاركة
        </a>
        <label class="compare-label">
          <input type="checkbox" class="compare" data-id="${t.id}" ${isCompared ? 'checked' : ''} aria-label="إضافة للمقارنة">
          قارن
        </label>
      </div>
    `;
    toolsList.appendChild(div);
  });
  
  toolCount.textContent = filtered.length;
  favCount.textContent = favorites.length;
  attachEvents();
}

function attachEvents(){
  document.querySelectorAll('.favorite').forEach(el => {
    const toggleFavorite = () => {
      const id = +el.dataset.id;
      if (favorites.includes(id)) {
        favorites = favorites.filter(n => n !== id);
      } else {
        favorites.push(id);
      }
      localStorage.setItem('favorites', JSON.stringify(favorites));
      renderTools();
    };
    
    el.onclick = toggleFavorite;
    el.onkeypress = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFavorite();
      }
    };
  });

  document.querySelectorAll('.star').forEach(el => {
    const rateItem = () => {
      const id = +el.dataset.id;
      const currentRating = ratings[id] || '';
      let r = prompt('قيم الأداة من 1 إلى 5:', currentRating);
      
      if (r === null) return; // User cancelled
      
      r = parseFloat(r);
      if (r >= 1 && r <= 5) {
        ratings[id] = r;
        localStorage.setItem('ratings', JSON.stringify(ratings));
        renderTools();
      } else if (r !== '') {
        alert('الرجاء إدخال رقم بين 1 و 5');
      }
    };
    
    el.onclick = rateItem;
    el.onkeypress = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        rateItem();
      }
    };
  });

  document.querySelectorAll('.compare').forEach(el => {
    el.onchange = () => {
      const id = +el.dataset.id;
      if (el.checked) {
        if (!compareList.includes(id)) {
          compareList.push(id);
        }
      } else {
        compareList = compareList.filter(n => n !== id);
      }
      updateCompareButton();
    };
  });
}

function updateCompareButton() {
  compareBtn.disabled = compareList.length < 2;
  compareCount.textContent = compareList.length;
}

compareBtn.onclick = () => {
  compareTableBody.innerHTML = '';
  compareList.forEach(id => {
    const t = tools.find(o => o.id === id);
    if (t) {
      compareTableBody.innerHTML += `<tr>
        <td>${t.name}</td>
        <td>$${t.price}</td>
        <td>${t.category}</td>
        <td>${t.ai ? '✅ نعم' : '❌ لا'}</td>
        <td>${ratings[id] ? '⭐ ' + ratings[id] : 'غير مقيّم'}</td>
      </tr>`;
    }
  });
  modal.style.display = 'flex';
};

closeBtn.onclick = () => modal.style.display = 'none';

clearCompareBtn.onclick = () => {
  compareList = [];
  updateCompareButton();
  renderTools();
  modal.style.display = 'none';
};

window.onclick = e => { 
  if (e.target === modal) modal.style.display = 'none'; 
};

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.style.display === 'flex') {
    modal.style.display = 'none';
  }
});

searchInput.oninput = renderTools;
categoryFilter.onchange = () => {
  currentCategory = categoryFilter.value;
  renderTools();
};

sortBy.onchange = () => {
  currentSort = sortBy.value;
  renderTools();
};

toggleDark.onclick = () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  toggleDark.textContent = isDark ? '☀️ الوضع النهاري' : '🌙 الوضع المظلم';
};

exportFavorites.onclick = () => {
  if (favorites.length === 0) {
    alert('ليس لديك أدوات مفضلة لتصديرها!');
    return;
  }

  const favoriteTools = tools.filter(t => favorites.includes(t.id));
  const exportData = favoriteTools.map(t => ({
    name: t.name,
    category: t.category,
    price: t.price,
    ai: t.ai,
    rating: ratings[t.id] || 'غير مقيّم'
  }));

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'my-favorite-ai-tools.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

window.addEventListener('DOMContentLoaded', () => {
  const isDark = JSON.parse(localStorage.getItem('darkMode'));
  if (isDark) {
    document.body.classList.add('dark-mode');
    toggleDark.textContent = '☀️ الوضع النهاري';
  }
  renderTools();
});
