import { LeadSource, LeadStatus, Priority, ActivityType } from '@prisma/client';
import { faker } from '@faker-js/faker';

export function generateLeads(companyId: number, employeeIds: string[]) {
  const leads = Array.from({ length: 20 }, () => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    company: faker.company.name(),
    sourceType: faker.helpers.enumValue(LeadSource),
    status: faker.helpers.enumValue(LeadStatus),
    priority: faker.helpers.enumValue(Priority),
    employeeId: faker.helpers.arrayElement(employeeIds),
    description: faker.lorem.paragraph(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    convertedAt: faker.helpers.arrayElement([null, faker.date.past()]),
    convertedClientId: null // Will be updated later if needed
  }));

  const activities = leads.flatMap(lead => 
    Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
      id: faker.string.uuid(),
      leadId: lead.id,
      type: faker.helpers.enumValue(ActivityType),
      description: faker.lorem.sentence(),
      employeeId: faker.helpers.arrayElement(employeeIds),
      dueDate: faker.date.future(),
      completed: faker.datatype.boolean(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }))
  );

  const documents = leads.flatMap(lead => 
    Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => ({
      id: faker.string.uuid(),
      leadId: lead.id,
      name: faker.system.fileName(),
      type: faker.helpers.arrayElement(['PDF', 'DOC', 'XLS', 'JPG']),
      url: faker.internet.url(),
      employeeId: faker.helpers.arrayElement(employeeIds),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }))
  );

  return { leads, leadActivities: activities, leadDocuments: documents };
}
