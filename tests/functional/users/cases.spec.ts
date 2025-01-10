import { test } from '@japa/runner';
import { UserFactory } from '#database/factories/user_factory';
import User from '#models/user';

import env from '#start/env';
import { NotebookFactory } from '#database/factories/notebook_factory';
import { NoteFactory } from '#database/factories/note_factory';
const aSuperUsers: string[] = env.get('SUPERUSERS').split(',');

// 1. USERS
//   1. anyone without a session can create a user: 200 OK
//   2. anyone without a session cannot: read, update, or delete a user: 401 Unauthorized
//   3. anyone without a session cannot post a user with an existing email: 422 Unprocessable Content
//   4. superuser with a session can read, update, and delete another user: 200 OK
//     1. delete user cascades and deletes their notebooks and notes
//   5. normal user with a session cannot read, update, nor delete another user: 403 Forbidden
//   6. normal user with a session can read, update, and delete their own user: 200 OK
//     1. delete user cascades and deletes their notebooks and notes
//   7. superuser with a session cannot update a user to take on an existing email: 422 Unprocessable Content
//   8. normal user with a session cannot update their own user to take on an existing email: 422 Unprocessable Content
//   9. normal user with a session can read notebooks for themself: 200 OK
//     1. normal user cannot read notebooks for another user: 403 Forbidden
//   10. superuser with a session can read notebooks of another user: 200 OK

test.group('Users cases', () => {

  test('setup', async () => {
    await UserFactory.merge({ email: aSuperUsers[0] }).create();
  }).skip(false);

  test('expected case 1.1', async ({ client, assert }) => {
    const response = await client.post(
      '/user/'
    ).json({
      email: 'test@test.com',
      password: 'test'
    });
    // response.dump();
    // response.dumpBody();
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'user');
    assert.property(response.body().data.user, 'email');
    assert.propertyVal(response.body().data.user, 'email', 'test@test.com');
  }).skip(false);

  test('expected case 1.2', async ({ client, assert }) => {
    let response = await client.get(
      '/user/1'
    );
    response.assertStatus(401);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Unauthorized access');

    response = await client.get(
      '/user/10'
    );
    response.assertStatus(401);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Unauthorized access');

    response = await client.put(
      '/user/1'
    ).json({
      email: 'test@email.com',
      password: 'test'
    });
    response.assertStatus(401);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Unauthorized access');

    response = await client.put(
      '/user/10'
    ).json({
      email: 'test@email.com',
      password: 'test'
    });
    response.assertStatus(401);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Unauthorized access');

    response = await client.delete(
      '/user/1'
    );
    response.assertStatus(401);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Unauthorized access');

    response = await client.delete(
      '/user/10'
    );
    response.assertStatus(401);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Unauthorized access');
  }).skip(false);

  test('expected case 1.3', async ({ client, assert }) => {
    const response = await client.post(
      '/user/'
    ).json({
      email: aSuperUsers[0],
      password: 'test'
    });
    response.assertStatus(422);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.deepEqual(response.body().data,
      [
        {
          message: 'email cannot already exist',
          rule: 'database.unique',
          field: 'email'
        }
      ]
    );
  }).skip(false);

  test('expected case 1.4 & 1.4.1', async ({ client, assert }) => {
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    const user = await UserFactory.create();
    const notebook1 = await NotebookFactory.merge({ userId: user.id }).create();
    const notebook2 = await NotebookFactory.merge({ userId: user.id }).create();
    const note11 = await NoteFactory.merge({ notebookId: notebook1.id, parent: null, prevSibling: null }).create();
    const note12 = await NoteFactory.merge({ notebookId: notebook1.id, parent: note11.id, prevSibling: null }).create();
    const note21 = await NoteFactory.merge({ notebookId: notebook2.id, parent: null, prevSibling: null }).create();
    const note22 = await NoteFactory.merge({ notebookId: notebook2.id, parent: null, prevSibling: note21.id }).create();
    let response = await client.get(
      `/user/${user.id}/notebooks/`
    ).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notebooks');
    assert.lengthOf(response.body().data.notebooks, 2);

    response = await client.get(
      `/notebook/${notebook1.id}/notes/`
    ).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notes');
    assert.lengthOf(response.body().data.notes, 2);

    response = await client.get(
      `/notebook/${notebook2.id}/notes/`
    ).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notes');
    assert.lengthOf(response.body().data.notes, 2);

    response = await client.get(
      `/user/${user.id}/`
    ).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'user');
    assert.property(response.body().data.user, 'email');
    assert.propertyVal(response.body().data.user, 'email', user.email);

    response = await client.put(
      `/user/${user.id}/`
    ).json({
      fullName: 'Changed Name'
    }).loginAs(superUser);
    response.assertStatus(200);
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'user');
    assert.property(response.body().data.user, 'fullName');
    assert.propertyVal(response.body().data.user, 'fullName', 'Changed Name');

    response = await client.get(
      `/user/${user.id}/`
    ).loginAs(superUser);
    response.assertStatus(200);
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'user');
    assert.property(response.body().data.user, 'fullName');
    assert.propertyVal(response.body().data.user, 'fullName', 'Changed Name');

    response = await client.delete(
      `/user/${user.id}/`
    ).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');

    response = await client.get(
      `/user/${user.id}/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');

    response = await client.get(
      `/note/${note11.id}/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/note/${note12.id}/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/note/${note21.id}/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/note/${note22.id}/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/notebook/${notebook1.id}/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/user/${user.id}/notebooks/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/notebook/${notebook1.id}/notes/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/notebook/${notebook2.id}/notes/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

  }).skip(false);

  test('expected case 1.5', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    let response = await client.get(
      `/user/${superUser.id}`
    ).loginAs(user);
    response.assertStatus(403);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Not allowed to view user');

    response = await client.put(
      `/user/${superUser.id}`
    ).json({
      fullName: 'test'
    }).loginAs(user);
    response.assertStatus(403);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Not allowed to edit user');

    response = await client.delete(
      `/user/${superUser.id}`
    ).loginAs(user);
    response.assertStatus(403);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Not allowed to delete user');
  }).skip(false);

  test('expected case 1.7', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    const response = await client.put(
      `/user/${superUser.id}`
    ).json({
      email: user.email
    }).loginAs(superUser);
    response.assertStatus(422);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.deepEqual(response.body().data,
      [
        {
          message: 'email cannot already exist',
          rule: 'database.unique',
          field: 'email'
        }
      ]
    );
  }).skip(false);

  test('expected case 1.6', async ({ client, assert }) => {
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    const user = await UserFactory.create();
    const notebook1 = await NotebookFactory.merge({ userId: user.id }).create();
    const notebook2 = await NotebookFactory.merge({ userId: user.id }).create();
    const note11 = await NoteFactory.merge({ notebookId: notebook1.id, parent: null, prevSibling: null }).create();
    const note12 = await NoteFactory.merge({ notebookId: notebook1.id, parent: note11.id, prevSibling: null }).create();
    const note21 = await NoteFactory.merge({ notebookId: notebook2.id, parent: null, prevSibling: null }).create();
    const note22 = await NoteFactory.merge({ notebookId: notebook2.id, parent: null, prevSibling: note21.id }).create();
    let response = await client.get(
      `/user/${user.id}/`
    ).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'user');
    assert.property(response.body().data.user, 'id');
    assert.propertyVal(response.body().data.user, 'id', user.id);

    response = await client.put(
      `/user/${user.id}/`
    ).json({
      fullName: 'Jenny Craig'
    }).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'user');
    assert.property(response.body().data.user, 'fullName');
    assert.propertyVal(response.body().data.user, 'fullName', 'Jenny Craig');

    response = await client.get(
      `/user/${user.id}/notebooks/`
    ).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notebooks');
    assert.lengthOf(response.body().data.notebooks, 2);

    response = await client.get(
      `/notebook/${notebook1.id}/notes/`
    ).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notes');
    assert.lengthOf(response.body().data.notes, 2);

    response = await client.get(
      `/notebook/${notebook2.id}/notes/`
    ).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notes');
    assert.lengthOf(response.body().data.notes, 2);

    response = await client.delete(
      `/user/${user.id}/`
    ).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');

    response = await client.get(
      `/notebook/${notebook1.id}/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/notebook/${notebook2.id}/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/note/${note11.id}/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/note/${note12.id}/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/note/${note21.id}/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/note/${note22.id}/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/notebook/${notebook1.id}/notes/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/notebook/${notebook2.id}/notes/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/user/${user.id}/notebooks/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');
  }).skip(false);

  test('expected case 1.8', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    const response = await client.put(
      `/user/${user.id}`
    ).json({
      email: superUser.email
    }).loginAs(user);
    response.assertStatus(422);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.deepEqual(response.body().data,
      [
        {
          message: 'email cannot already exist',
          rule: 'database.unique',
          field: 'email'
        }
      ]
    );
  }).skip(false);

  test('expected case 1.9 & 1.9.1', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    await NotebookFactory.merge({ userId: user.id }).create();
    await NotebookFactory.merge({ userId: user.id }).create();
    await NotebookFactory.merge({ userId: superUser.id }).create();
    let response = await client.get(
      `/user/${user.id}/notebooks/`
    ).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notebooks');
    assert.lengthOf(response.body().data.notebooks, 2);

    response = await client.get(
      `/user/${superUser.id}/notebooks/`
    ).loginAs(user);
    response.assertStatus(403);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Not allowed to view notebooks');
  }).skip(false);

  test('expected case 1.10', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    await NotebookFactory.merge({ userId: user.id }).create();
    await NotebookFactory.merge({ userId: user.id }).create();
    const response = await client.get(
      `/user/${user.id}/notebooks/`
    ).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notebooks');
    assert.lengthOf(response.body().data.notebooks, 2);
  }).skip(false);

  test('cleanup', async ({ client }) => {
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    const response = await client.delete(
      `/user/${superUser.id}`
    ).loginAs(superUser);
    response.assertStatus(200);
  }).skip(false);

});
