import { test } from '@japa/runner';
import { UserFactory } from '#database/factories/user_factory';
import User from '#models/user';

import env from '#start/env';
const aSuperUsers: string[] = env.get('SUPERUSERS').split(',');

// 0. USERS (since we're using the authApiClient Japa plugin, we don't test POST session)
//   1. GET, PUT, PATCH are non-existent methods: 404 Not Found
//     1. Even when logged in, these are non-existent methods
//   2. DELETE always works: 200 OK

test.group('Session cases', () => {

  test('setup', async () => {
    await UserFactory.merge({ email: aSuperUsers[0] }).create();
  }).skip(false);

  test('expected case 0.1 & 0.1.1', async ({ client, assert }) => {
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    let response = await client.get(
      '/session/'
    );
    // response.dump();
    // response.dumpBody();
    response.assertStatus(404);

    response = await client.get(
      '/session/'
    ).loginAs(superUser);
    response.assertStatus(404);

    response = await client.put(
      '/session/'
    );
    response.assertStatus(404);

    response = await client.put(
      '/session/'
    ).loginAs(superUser);
    response.assertStatus(404);

    response = await client.patch(
      '/session/'
    );
    response.assertStatus(404);

    response = await client.patch(
      '/session/'
    ).loginAs(superUser);
    response.assertStatus(404);
  }).skip(false);

  test('expected case 0.2', async ({ client, assert }) => {
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    let response = await client.delete(
      '/session/'
    );
    response.assertStatus(200);

    response = await client.delete(
      '/session/'
    ).loginAs(superUser);
    response.assertStatus(200);
  });

  test('cleanup', async ({ client }) => {
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    const response = await client.delete(
      `/user/${superUser.id}`
    ).loginAs(superUser);
    response.assertStatus(200);
  }).skip(false);

});
