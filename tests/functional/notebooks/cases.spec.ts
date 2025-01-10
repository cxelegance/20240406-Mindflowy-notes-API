import { test } from '@japa/runner';
import { UserFactory } from '#database/factories/user_factory';
import { NotebookFactory } from '#database/factories/notebook_factory';
import { NoteFactory } from '#database/factories/note_factory';
import User from '#models/user';

import env from '#start/env';
const aSuperUsers: string[] = env.get('SUPERUSERS').split(',');

// 2. NOTEBOOKS
//   1. anyone without a session cannot: create, read, update, or delete a notebook: 401 Unauthorized
//   2. normal user with a session can create a notebook: 200 OK
//     1. said user can read, update, and delete said notebook: 200 OK
//       1. delete notebook cascades and deletes its notes
//   3. normal user with a sesssion cannot create, read, update, nor delete a notebook belonging to another user: 403 Forbidden
//   4. superuser with a session can create, read, update, and delete a notebook for or belonging to another user: 200 OK
//     1. delete notebook cascades and deletes its notes
//   5. normal user with a session can delete all notes by notebook: 200 OK
//     1. normal user with a session cannot delete notes by notebook for a notebook belonging to another user: 403 Forbidden
//   6. superuser with a session can delete notes by notebook for a normal user: 200 OK
//   7. the route for updating notes by notebook is not yet functioning: 404 Not Found

test.group('Notebooks cases', () => {

  test('setup', async () => {
    await UserFactory.merge({ email: aSuperUsers[0] }).create();
  }).skip(false);

  test('expected case 2.1', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const notebook = await NotebookFactory.merge({ userId: user.id }).create();
    let response = await client.post(
      '/notebook/'
    ).json({
      userId: user.id,
      name: 'test',
      description: 'testing'
    });
    // response.dump();
    // response.dumpBody();
    response.assertStatus(401);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Unauthorized access');

    response = await client.get(
      `/notebook/${notebook.id}`
    );
    response.assertStatus(401);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Unauthorized access');

    response = await client.put(
      `/notebook/${notebook.id}`
    ).json({
      userId: user.id,
      name: 'a change',
      description: 'testing change'
    });
    response.assertStatus(401);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Unauthorized access');

    response = await client.delete(
      `/notebook/${notebook.id}`
    );
    response.assertStatus(401);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Unauthorized access');
  }).skip(false);

  test('expected case 2.2, 2.2.1 & 2.2.1.1', async ({ client, assert }) => {
    const user = await UserFactory.create();
    let notebookId: number, noteId: number;
    let response = await client.post(
      '/notebook/'
    ).json({
      userId: user.id,
      name: 'a notebook belonging to regular user',
      description: 'testing'
    }).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notebook');
    assert.property(response.body().data.notebook, 'userId');
    assert.propertyVal(response.body().data.notebook, 'userId', user.id);
    assert.property(response.body().data.notebook, 'id');
    notebookId = response.body().data.notebook.id;

    response = await client.get(
      `/notebook/${notebookId}`
    ).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notebook');
    assert.property(response.body().data.notebook, 'userId');
    assert.propertyVal(response.body().data.notebook, 'userId', user.id);
    assert.property(response.body().data.notebook, 'id');
    assert.propertyVal(response.body().data.notebook, 'id', notebookId);

    response = await client.put(
      `/notebook/${notebookId}`
    ).json({
      description: 'updated'
    }).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notebook');
    assert.property(response.body().data.notebook, 'description');
    assert.propertyVal(response.body().data.notebook, 'description', 'updated');

    response = await client.post(
      '/note/'
    ).json({
      notebookId,
      data: 'testing note'
    }).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'note');
    assert.property(response.body().data.note, 'notebookId');
    assert.propertyVal(response.body().data.note, 'notebookId', notebookId);
    assert.property(response.body().data.note, 'data');
    assert.propertyVal(response.body().data.note, 'data', 'testing note');
    assert.property(response.body().data.note, 'id');
    noteId = response.body().data.note.id;

    response = await client.delete(
      `/notebook/${notebookId}`
    ).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');

    response = await client.get(
      `/notebook/${notebookId}`
    ).loginAs(user);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/note/${noteId}`
    ).loginAs(user);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');
  }).skip(false);

  test('expected case 2.3', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    const notebook = await NotebookFactory.merge({ userId: superUser.id }).create();
    let response = await client.post(
      '/notebook/'
    ).json({
      userId: superUser.id,
      name: 'a notebook belonging to super user',
      description: 'testing'
    }).loginAs(user);
    response.assertStatus(403);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Not allowed to create notebook');

    response = await client.get(
      `/notebook/${notebook.id}`
    ).loginAs(user);
    response.assertStatus(403);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Not allowed to view notebook');

    response = await client.put(
      `/notebook/${notebook.id}`
    ).json({
      userId: user.id,
      name: 'a notebook belonging to super user',
      description: 'but stealing it over to normal user'
    }).loginAs(user);
    response.assertStatus(403);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Not allowed to update notebook');

    response = await client.delete(
      `/notebook/${notebook.id}`
    ).loginAs(user);
    response.assertStatus(403);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Not allowed to delete notebook');
  }).skip(false);

  test('expected case 2.4 & 2.4.1', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    let notebookId: number, noteId: number;
    let response = await client.post(
      '/notebook/'
    ).json({
      userId: user.id,
      name: 'a notebook belonging to regular user',
      description: 'testing'
    }).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notebook');
    assert.property(response.body().data.notebook, 'userId');
    assert.propertyVal(response.body().data.notebook, 'userId', user.id);
    assert.property(response.body().data.notebook, 'id');
    notebookId = response.body().data.notebook.id;

    response = await client.post(
      '/note/'
    ).json({
      notebookId,
      data: 'testing note'
    }).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'note');
    assert.property(response.body().data.note, 'notebookId');
    assert.propertyVal(response.body().data.note, 'notebookId', notebookId);
    assert.property(response.body().data.note, 'data');
    assert.propertyVal(response.body().data.note, 'data', 'testing note');
    assert.property(response.body().data.note, 'id');
    noteId = response.body().data.note.id;

    response = await client.get(
      `/note/${noteId}`
    ).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'note');
    assert.property(response.body().data.note, 'notebookId');
    assert.propertyVal(response.body().data.note, 'notebookId', notebookId);
    assert.property(response.body().data.note, 'data');
    assert.propertyVal(response.body().data.note, 'data', 'testing note');
    assert.property(response.body().data.note, 'id');

    response = await client.put(
      `/notebook/${notebookId}`
    ).json({
      description: 'updated'
    }).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notebook');
    assert.property(response.body().data.notebook, 'description');
    assert.propertyVal(response.body().data.notebook, 'description', 'updated');

    response = await client.delete(
      `/notebook/${notebookId}`
    ).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');

    response = await client.get(
      `/notebook/${notebookId}`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/note/${noteId}`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/notebook/${notebookId}`
    ).loginAs(user);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');

    response = await client.get(
      `/note/${noteId}`
    ).loginAs(user);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Row not found');
  }).skip(false);

  test('expected case 2.5 & 2.5.1', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    const notebook1 = await NotebookFactory.merge({ userId: user.id }).create();
    const notebook2 = await NotebookFactory.merge({ userId: superUser.id }).create();
    await NoteFactory.merge({ notebookId: notebook1.id, parent: null, prevSibling: null }).create();
    await NoteFactory.merge({ notebookId: notebook2.id, parent: null, prevSibling: null }).create();
    let response = await client.delete(
      `/notebook/${notebook1.id}/notes/`
    ).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');

    response = await client.get(
      `/notebook/${notebook1.id}/notes/`
    ).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notes');
    assert.lengthOf(response.body().data.notes, 0);

    response = await client.delete(
      `/notebook/${notebook2.id}/notes/`
    ).loginAs(user);
    response.assertStatus(403);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Not allowed to delete notes in this notebook');
  }).skip(false);

  test('expected case 2.6', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    const notebook1 = await NotebookFactory.merge({ userId: user.id }).create();
    await NoteFactory.merge({ notebookId: notebook1.id, parent: null, prevSibling: null }).create();
    await NoteFactory.merge({ notebookId: notebook1.id, parent: null, prevSibling: null }).create();
    let response = await client.get(
      `/notebook/${notebook1.id}/notes/`
    ).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notes');
    assert.lengthOf(response.body().data.notes, 2);

    response = await client.delete(
      `/notebook/${notebook1.id}/notes/`
    ).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');

    response = await client.get(
      `/notebook/${notebook1.id}/notes/`
    ).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'notes');
    assert.lengthOf(response.body().data.notes, 0);
  }).skip(false);

  test('expected case 2.7', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    const notebook1 = await NotebookFactory.merge({ userId: user.id }).create();
    await NoteFactory.merge({ notebookId: notebook1.id, parent: null, prevSibling: null }).create();
    let response = await client.put(
      `/notebook/${notebook1.id}/notes/`
    ).loginAs(superUser);
    response.assertStatus(404);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Route temporarily unavailable');
  }).skip(false);

  test('cleanup', async ({ client }) => {
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    const response = await client.delete(
      `/user/${superUser.id}`
    ).loginAs(superUser);
    response.assertStatus(200);
  }).skip(false);

})
