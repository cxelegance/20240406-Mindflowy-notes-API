import factory from '@adonisjs/lucid/factories';
import Note from '#models/note';

export const NoteFactory = factory
  .define(Note, async ({ faker }) => {
    return {
      notebookId: faker.number.int(),
      prevSibling: faker.number.int(),
      parent: faker.number.int(),
      data: faker.lorem.text()
    };
  })
  .build();
