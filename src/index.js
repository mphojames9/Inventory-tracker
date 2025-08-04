let items = JSON.parse(localStorage.getItem('inventory')) || [];

function saveToStorage() {
  localStorage.setItem('inventory', JSON.stringify(items));
}

function renderItems(filteredItems = items) {
  inventoryList.innerHTML = '';
  const grouped = filteredItems.reduce((acc, item, index) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push({ ...item, index });
    return acc;
  }, {});
}
