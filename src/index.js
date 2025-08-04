let items = JSON.parse(localStorage.getItem('inventory')) || [];

function saveToStorage() {
  localStorage.setItem('inventory', JSON.stringify(items));
}

//Implement inventory render function with dynamic DOM creation
function renderItems(filteredItems = items) {
  inventoryList.innerHTML = '';
  const grouped = filteredItems.reduce((acc, item, index) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push({ ...item, index });
    return acc;
  }, {});

}

const inc = document.createElement('button');
inc.textContent = '+';
inc.className = 'btn inc';
inc.onclick = () => {
  items[index].count++;
  saveToStorage();
  renderItems();
};

itemDiv.setAttribute('draggable', 'true');
itemDiv.dataset.index = index;

itemDiv.addEventListener('dragstart', () => dragSrcIndex = index);
itemDiv.addEventListener('drop', (e) => {
  const targetIndex = +itemDiv.dataset.index;
});

exportBtn.onclick = () => {
  let csv = "Item Name,Category,Count\n";
  items.forEach(i => csv += `${i.name},${i.category},${i.count}\n`);
};

const theme = localStorage.getItem('theme');
if (theme === 'dark') document.body.classList.add('dark');

themeBtn.onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
};