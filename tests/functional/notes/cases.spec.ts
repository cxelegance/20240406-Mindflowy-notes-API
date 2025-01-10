import { test } from '@japa/runner';
import { NotebookFactory } from '#database/factories/notebook_factory';
import { NoteFactory } from '#database/factories/note_factory';
import { UserFactory } from '#database/factories/user_factory';
import User from '#models/user';

import env from '#start/env';
const aSuperUsers: string[] = env.get('SUPERUSERS').split(',');

// 3. NOTES
//   1. anyone without a session cannot: create, read, update, or delete a note: 401 Unauthorized
//   2. normal user with a session can create a note in a notebook belonging to them: 200 OK
//     1. said user can read, update, and delete said note: 200 OK
//   3. normal user with a session cannot create, read, update, nor delete a note in a notebook belonging to another user: 403 Forbidden
//   4. normal user with a session cannot update a note in their own notebook such that it moves to a notebook of another user: 403 Forbidden
//   5. superuser with a session can create, read, update, and delete a note in a notebook belonging to another user: 200 OK

test.group('Notes cases', () => {

  test('setup', async () => {
    await UserFactory.merge({ email: aSuperUsers[0] }).create();
  }).skip(false);

  test('expected case 3.1', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const notebook = await NotebookFactory.merge({ userId: user.id }).create();
    const notebook2 = await NotebookFactory.merge({ userId: user.id }).create();
    const note = await NoteFactory.merge({ notebookId: notebook.id, parent: null, prevSibling: null }).create();
    let response = await client.get(
      `/note/${note.id}`
    );
    // response.dump();
    // response.dumpBody();
    response.assertStatus(401);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Unauthorized access');

    response = await client.post(
      `/note/`
    ).json({
      notebookId: notebook.id,
      data: 'testing'
    });
    response.assertStatus(401);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Unauthorized access');

    response = await client.put(
      `/note/${note.id}`
    ).json({
      notebookId: notebook2.id,
      data: 'testing'
    });
    response.assertStatus(401);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Unauthorized access');

    response = await client.delete(
      `/note/${note.id}`
    );
    response.assertStatus(401);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Unauthorized access');
  }).skip(false);

  test('expected case 3.2 & 3.2.1', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const notebook = await NotebookFactory.merge({ userId: user.id }).create();
    const noteText = 'testing';
    let noteId = null;
    let response = await client.post(
      `/note/`
    ).json({
      notebookId: notebook.id,
      data: noteText
    }).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'note');
    assert.property(response.body().data.note, 'notebookId');
    assert.propertyVal(response.body().data.note, 'notebookId', notebook.id);
    assert.property(response.body().data.note, 'data');
    assert.propertyVal(response.body().data.note, 'data', noteText);
    assert.property(response.body().data.note, 'id');
    noteId = response.body().data.note.id;

    response = await client.get(
      `/note/${noteId}`
    ).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'note');
    assert.property(response.body().data.note, 'notebookId');
    assert.propertyVal(response.body().data.note, 'notebookId', notebook.id);
    assert.property(response.body().data.note, 'data');
    assert.propertyVal(response.body().data.note, 'data', noteText);
    assert.property(response.body().data.note, 'id');
    assert.propertyVal(response.body().data.note, 'id', noteId);

    response = await client.put(
      `/note/${noteId}`
    ).json({
      data: `${noteText}: updated}`
    }).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'note');
    assert.property(response.body().data.note, 'notebookId');
    assert.propertyVal(response.body().data.note, 'notebookId', notebook.id);
    assert.property(response.body().data.note, 'data');
    assert.propertyVal(response.body().data.note, 'data', `${noteText}: updated}`);
    assert.property(response.body().data.note, 'id');

    response = await client.delete(
      `/note/${noteId}`
    ).loginAs(user);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
  }).skip(false);

  test('expected case 3.3', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    const notebook = await NotebookFactory.merge({ userId: superUser.id }).create();
    const note = await NoteFactory.merge({ notebookId: notebook.id, parent: null, prevSibling: null }).create();
    const noteText = 'testing';
    let response = await client.post(
      `/note/`
    ).json({
      notebookId: notebook.id,
      data: noteText
    }).loginAs(user);
    response.assertStatus(403);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Not allowed to create in notebook');

    response = await client.get(
      `/note/${note.id}`
    ).loginAs(user);
    response.assertStatus(403);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Not allowed to read this note');

    response = await client.put(
      `/note/${note.id}`
    ).json({
      data: `${noteText}: updated`
    }).loginAs(user);
    response.assertStatus(403);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Not allowed to put notes in this notebook');

    response = await client.delete(
      `/note/${note.id}`
    ).loginAs(user);
    response.assertStatus(403);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Not allowed to delete this note');
  }).skip(false);

  test('expected case 3.4', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const user2 = await UserFactory.create();
    const notebook = await NotebookFactory.merge({ userId: user.id }).create();
    const notebook2 = await NotebookFactory.merge({ userId: user2.id }).create();
    const note = await NoteFactory.merge({ notebookId: notebook.id, parent: null, prevSibling: null }).create();
    const response = await client.put(
      `/note/${note.id}`
    ).json({
      notebookId: notebook2.id
    }).loginAs(user);
    response.assertStatus(403);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'fail');
    assert.property(response.body(), 'data');
    assert.propertyVal(response.body(), 'data', 'Not allowed to put notes in this notebook');
  }).skip(false);

  test('expected case 3.5', async ({ client, assert }) => {
    const user = await UserFactory.create();
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    const notebook = await NotebookFactory.merge({ userId: user.id }).create();
    const note = await NoteFactory.merge({ notebookId: notebook.id, parent: null, prevSibling: null }).create();
    let noteText = 'testing';
    let response = await client.post(
      `/note/`
    ).json({
      notebookId: notebook.id,
      data: noteText
    }).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'note');
    assert.property(response.body().data.note, 'notebookId');
    assert.propertyVal(response.body().data.note, 'notebookId', notebook.id);
    assert.property(response.body().data.note, 'data');
    assert.propertyVal(response.body().data.note, 'data', noteText);
    assert.property(response.body().data.note, 'id');

    response = await client.get(
      `/note/${note.id}`
    ).loginAs(superUser);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'note');
    assert.property(response.body().data.note, 'notebookId');
    assert.propertyVal(response.body().data.note, 'notebookId', notebook.id);
    assert.property(response.body().data.note, 'data');
    assert.propertyVal(response.body().data.note, 'data', note.data);
    noteText = note.data;

    response = await client.put(
      `/note/${note.id}`
    ).json({
      data: `${noteText}: updated`
    }).loginAs(superUser);
    response.assertStatus(200);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
    assert.property(response.body(), 'data');
    assert.property(response.body().data, 'note');
    assert.property(response.body().data.note, 'notebookId');
    assert.propertyVal(response.body().data.note, 'notebookId', notebook.id);
    assert.property(response.body().data.note, 'data');
    assert.propertyVal(response.body().data.note, 'data', `${noteText}: updated`);

    response = await client.delete(
      `/note/${note.id}`
    ).loginAs(superUser);
    assert.property(response.body(), 'status');
    assert.propertyVal(response.body(), 'status', 'success');
  }).skip(false);

  test('cleanup', async ({ client }) => {
    const superUser = await User.findByOrFail('email', aSuperUsers[0]);
    const response = await client.delete(
      `/user/${superUser.id}`
    ).loginAs(superUser);
    response.assertStatus(200);
  }).skip(false);

})
