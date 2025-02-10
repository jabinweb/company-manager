import { EmployeeRole, EmployeeStatus, EmploymentType, Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker";

function generateId() {
  return `emp_${faker.string.alphanumeric(10)}`;
}

export const createEmployees = (companyId: number): Prisma.EmployeeCreateInput[] => {
  return Array.from({ length: 10 }).map(() => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    return {
      id: generateId(),
      employeeId: `EMP${faker.string.alphanumeric(8).toUpperCase()}`,
      name: `${firstName} ${lastName}`,
      email,
      phone: faker.phone.number({ style: 'international' }),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
      },
      jobTitle: faker.person.jobTitle(),
      department: faker.commerce.department(),
      dateJoined: faker.date.past(),
      role: faker.helpers.arrayElement(Object.values(EmployeeRole)),
      employmentType: faker.helpers.arrayElement(Object.values(EmploymentType)),
      status: faker.helpers.arrayElement(Object.values(EmployeeStatus)),
      isApproved: faker.datatype.boolean(),
      avatar: faker.image.avatar(), // Changed from internet.avatar to image.avatar
      Company_Employee_companyIdToCompany: {
        connect: {
          id: companyId,
        },
      },
      updatedAt: new Date(),
    };
  });
};
