  
  const addItemForm = document.getElementById('addItemForm');
    const itemNameInput = document.getElementById('itemNameInput');
    const categoryInput = document.getElementById('categoryInput');
    const inventoryList = document.getElementById('inventoryList');
    const totalCountDisplay = document.getElementById('totalCount');
    const exportBtn = document.getElementById('exportBtn');
    const searchInput = document.getElementById('searchInput');
    const feedback = document.getElementById('feedback');
    const themeBtn = document.getElementById('toggleTheme');

    let items = JSON.parse(localStorage.getItem('inventory')) || [];
    let dragSrcIndex = null;

    function saveToStorage() {
      localStorage.setItem('inventory', JSON.stringify(items));
    }

    function updateTotalCount() {
      const total = items.reduce((sum, item) => sum + item.count, 0);
      totalCountDisplay.textContent = `Total Items: ${total}`;
    }

    function showFeedback(message, color = "#4CAF50") {
      feedback.textContent = message;
      feedback.style.color = color;
      feedback.classList.add("show");
      setTimeout(() => feedback.classList.remove("show"), 2500);
    }

    function renderItems(filteredItems = items) {
      inventoryList.innerHTML = '';
      const grouped = filteredItems.reduce((acc, item, index) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push({ ...item, index });
        return acc;
      }, {});

      Object.keys(grouped).forEach(category => {
        const section = document.createElement('div');
        section.className = 'category-section';

        const header = document.createElement('div');
        header.className = 'category-header';
        header.textContent = category;

        const itemList = document.createElement('div');
        itemList.className = 'item-list';

        grouped[category].forEach(({ name, count, index }) => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'item';
          if (count <= 0) itemDiv.classList.add('low-stock');

          itemDiv.setAttribute('draggable', 'true');
          itemDiv.dataset.index = index;

          itemDiv.addEventListener('dragstart', () => dragSrcIndex = index);
          itemDiv.addEventListener('dragover', e => e.preventDefault());
          itemDiv.addEventListener('drop', (e) => {
            const targetIndex = +itemDiv.dataset.index;
            if (dragSrcIndex !== null && targetIndex !== dragSrcIndex) {
              const temp = items[dragSrcIndex];
              items.splice(dragSrcIndex, 1);
              items.splice(targetIndex, 0, temp);
              saveToStorage();
              renderItems();
            }
            dragSrcIndex = null;
          });

          const nameSpan = document.createElement('span');
          nameSpan.textContent = name;

          const controls = document.createElement('div');
          controls.className = 'controls';

          const editName = document.createElement('button');
          editName.textContent = '✏️';
          editName.className = 'btn editName';
          editName.onclick = () => {
            const newName = prompt("Edit item name:", name);
            if (newName) {
              items[index].name = newName.trim();
              saveToStorage();
              renderItems();
              showFeedback("Name updated");
            }
          };

          const editCat = document.createElement('button');
          editCat.textContent = '📁';
          editCat.className = 'btn editCat';
          editCat.onclick = () => {
            const newCat = prompt("Change category:", category);
            if (newCat && newCat.trim()) {
              items[index].category = newCat.trim();
              saveToStorage();
              renderItems();
              showFeedback("Category changed");
            }
          };

          const dec = document.createElement('button');
          dec.textContent = '–';
          dec.className = 'btn dec';
          dec.onclick = () => {
  if (items[index].count > 0) {
    items[index].count--;
    saveToStorage();
    renderItems();
  } else {
    showFeedback("Count can't go below 0", "red");
  }
};


          const countSpan = document.createElement('span');
          countSpan.className = 'count';
          countSpan.textContent = count;

          const inc = document.createElement('button');
          inc.textContent = '+';
          inc.className = 'btn inc';
          inc.onclick = () => { items[index].count++; saveToStorage(); renderItems(); };

          const reset = document.createElement('button');
          reset.textContent = 'Reset';
          reset.className = 'btn reset';
          reset.onclick = () => { items[index].count = 0; saveToStorage(); renderItems(); };

          const del = document.createElement('button');
          del.textContent = '🗑️';
          del.className = 'btn del';
          del.onclick = () => { items.splice(index, 1); saveToStorage(); renderItems(); };

          controls.append(editName, editCat, dec, countSpan, inc, reset, del);
          itemDiv.append(nameSpan, controls);
          itemList.appendChild(itemDiv);
        });

        section.append(header, itemList);
        inventoryList.appendChild(section);
      });

      updateTotalCount();
    }

    addItemForm.onsubmit = e => {
      e.preventDefault();
      const name = itemNameInput.value.trim();
      const category = categoryInput.value;
      if (!name || !category) return;
      const exists = items.some(i => i.name.toLowerCase() === name.toLowerCase() && i.category === category);
      if (exists) return showFeedback("Item already exists", "red");
      items.push({ name, category, count: 0 });
      saveToStorage(); renderItems(); addItemForm.reset(); showFeedback("Item added");
    };

    searchInput.oninput = () => {
      const term = searchInput.value.trim().toLowerCase();
      const filtered = items.filter(item => item.name.toLowerCase().includes(term) || item.category.toLowerCase().includes(term));
      renderItems(filtered);
    };

    exportBtn.onclick = () => {
      let csv = "Item Name,Category,Count\n";
      items.forEach(i => csv += `${i.name},${i.category},${i.count}\n`);
      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'inventory.csv';
      link.click();
    };

    document.getElementById('importCSV').addEventListener('change', e => {
      const reader = new FileReader();
      reader.onload = ev => {
        const lines = ev.target.result.split('\n').slice(1);
        let count = 0;
        lines.forEach(l => {
          const [name, category, num] = l.split(',');
          if (name && category && !items.find(i => i.name === name && i.category === category)) {
            items.push({ name: name.trim(), category: category.trim(), count: parseInt(num) || 0 });
            count++;
          }
        });
        saveToStorage(); renderItems(); showFeedback(`${count} items imported`);
      };
      reader.readAsText(e.target.files[0]);
    });

    const theme = localStorage.getItem('theme');
    if (theme === 'dark') document.body.classList.add('dark');
    themeBtn.onclick = () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    };

    renderItems();