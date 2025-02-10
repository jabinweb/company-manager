import { faker } from '@faker-js/faker';

const categories = [
  'Electronics', 'Clothing', 'Books', 'Home & Kitchen',
  'Sports', 'Toys', 'Beauty', 'Automotive'
];

function generateId() {
  return `prd_${faker.string.alphanumeric(10)}`;
}

export function generateProducts(companyId: number) {
  return Array.from({ length: 10 }).map(() => ({
    id: generateId(), // Add ID generation
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    category: faker.helpers.arrayElement(categories),
    quantity: faker.number.int({ min: 0, max: 100 }),
    companyId,
    minQuantity: faker.number.int({ min: 5, max: 20 }),
    maxQuantity: faker.number.int({ min: 50, max: 200 }),
    reorderPoint: faker.number.int({ min: 10, max: 30 }),
    updatedAt: new Date(),
    createdAt: new Date(), // Add createdAt
  }));
}