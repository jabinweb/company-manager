import { PrismaClient } from "@prisma/client";
import { generateProducts } from "./data/products";
import { createEmployees } from "./data/employees";
import { createClients } from "./data/clients";

const prisma = new PrismaClient();

async function main() {
  try {
    const company = await prisma.company.findFirst();
    if (!company) throw new Error("No company found");

    console.log("Creating sample data...");
  
    // Create products
    const products = generateProducts(company.id);
    await Promise.all(
      products.map((product) =>
        prisma.product.create({
          data: product,
        })
      )
    );

    // Create employees
    const employees = createEmployees(company.id);
    await Promise.all(
      employees.map((employee) =>
        prisma.employee.create({
          data: employee,
        })
      )
    );

    // Create clients
    const clients = createClients(company.id);
    await Promise.all(
      clients.map((client) =>
        prisma.client.create({
          data: client,
        })
      )
    );

    console.log(`Created:`);
    console.log(`- ${products.length} products`);
    console.log(`- ${employees.length} employees`);
    console.log(`- ${clients.length} clients`);
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });