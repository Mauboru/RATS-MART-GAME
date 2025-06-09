export function save(key, money, playerX, playerY, cashier, stocker, generatorObjects, boxes, spots) {
  const data = { money, playerX, playerY, cashier, stocker, generatorObjects, boxes, spots};
  localStorage.setItem(key, JSON.stringify(data));
}

export function load(key) {
  const rawData = localStorage.getItem(key);
  if (!rawData) return null;
  return JSON.parse(rawData);
}
