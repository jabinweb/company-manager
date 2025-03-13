import { PrismaClient } from "@prisma/client";
import { generateProducts } from "./data/products";
import { createEmployees } from "./data/employees";
import { createClients } from "./data/clients";
import { generateLeads } from "./data/leads";

const prisma = new PrismaClient();

async function main() {
  try {
    const company = await prisma.company.findFirst();
    if (!company) throw new Error("No company found");

    console.log("Creating sample data...");
  
    // Create employees first since other entities depend on them
    const employees = createEmployees(company.id);
    const createdEmployees = await Promise.all(
      employees.map((employee) =>
        prisma.employee.create({
          data: employee,
        })
      )
    );
    
    // Get employee IDs for leads
    const employeeIds = createdEmployees.map(emp => emp.id);

    // Create products
    const products = generateProducts(company.id);
    await Promise.all(
      products.map((product) =>
        prisma.product.create({
          data: product,
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

    // Create leads and related data
    const { leads, leadActivities, leadDocuments } = generateLeads(company.id, employeeIds);
    
    // Create leads first
    await Promise.all(
      leads.map((lead) =>
        prisma.lead.create({
          data: lead,
        })
      )
    );

    // Create activities
    await Promise.all(
      leadActivities.map((activity) =>
        prisma.leadActivity.create({
          data: activity,
        })
      )
    );

    // Create documents
    await Promise.all(
      leadDocuments.map((document) =>
        prisma.leadDocument.create({
          data: document,
        })
      )
    );

    console.log(`Created:`);
    console.log(`- ${employees.length} employees`);
    console.log(`- ${products.length} products`);
    console.log(`- ${clients.length} clients`);
    console.log(`- ${leads.length} leads`);
    console.log(`- ${leadActivities.length} lead activities`);
    console.log(`- ${leadDocuments.length} lead documents`);
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