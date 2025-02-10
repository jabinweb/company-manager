import { Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker";

function generateId() {
  return `prd_${faker.string.alphanumeric(10)}`;
}

export const createClients = (companyId: number): Prisma.ClientCreateInput[] => {
  return Array.from({ length: 5 }).map(() => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    return {
      id: generateId(), // Add ID generation
      name: faker.company.name(),
      contact: `${firstName} ${lastName}`,
      email,
      phone: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
      },
      Company: {
        connect: {
          id: companyId,
        },
      },
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    };
  });
};
