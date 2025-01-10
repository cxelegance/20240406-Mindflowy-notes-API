import factory from '@adonisjs/lucid/factories';
import Notebook from '#models/notebook';
import { NoteFactory } from './note_factory.js';

export const NotebookFactory = factory
  .define(Notebook, async ({ faker }) => {
    return {
      userId: faker.number.int(),
      name: faker.lorem.words(3),
      description: faker.lorem.words({ min: 3, max: 10 })
    };
  })
  .relation('notes', () => NoteFactory)
  .build();
