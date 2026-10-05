// Fills the shop with a few starter items (skips names that already exist).
//   npm run seed:shop
const { migrate, close } = require('../src/database');
const shop = require('../src/services/shop');
const log = require('../src/core/logger').child('seed');

const ITEMS = [
  {
    name: 'Space Horse',
    price: 500,
    description: 'A strong and fast steed bred on Mars.',
    consumable: false,
  },
  {
    name: 'Plasma Sword',
    price: 300,
    description: 'A sharp blade forged in a dying star.',
    consumable: false,
  },
  {
    name: 'Healing Potion',
    price: 50,
    description: 'Restores your health after a rough jump.',
    consumable: true,
  },
  {
    name: 'Oxygen Tank',
    price: 120,
    description: 'Keeps you breathing on spacewalks.',
    consumable: true,
  },
];

migrate();
let added = 0;
for (const item of ITEMS) {
  if (shop.findProductByName(item.name)) continue;
  shop.addProduct(item);
  added++;
}
close();
log.info(`Added ${added} item(s) to the shop.`);
