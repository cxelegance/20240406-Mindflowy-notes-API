import factory from '@adonisjs/lucid/factories';
import User from '#models/user';
import { NotebookFactory } from './notebook_factory.js';

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      fullName: null,
      email: faker.internet.email(),
      password: faker.internet.password()
    };
  })
  .relation('notebooks', () => NotebookFactory)
  .build();
