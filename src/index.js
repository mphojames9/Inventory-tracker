let items = JSON.parse(localStorage.getItem('inventory')) || [];

function saveToStorage() {
  localStorage.setItem('inventory', JSON.stringify(items));
}
