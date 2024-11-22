const { Sequelize } = require('sequelize');
const { Product } = require('../models/Product');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
});

(async () => {
  await sequelize.sync();

  const items = [
    {
      name: 'Horse',
      price: 500,
      description: 'A strong and fast horse.',
      consumable: false,
    },
    {
      name: 'Sword',
      price: 300,
      description: 'A sharp and sturdy sword.',
      consumable: false,
    },
    {
      name: 'Healing Potion',
      price: 50,
      description: 'Restores health.',
      consumable: true,
    },
  ];

  await Product.bulkCreate(items);
  console.log('Shop has been populated with items.');
})();
