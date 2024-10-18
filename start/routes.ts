/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router';
import NotebooksController from '#controllers/notebooks_controller';
import NotesController from '#controllers/notes_controller';
import UsersController from '#controllers/users_controller';
import SessionsController from '#controllers/sessions_controller';
import { middleware } from '#start/kernel';

router.group(() => {

  router.post('', [NotebooksController, 'create']);
  router.get(':id/notes/', [NotesController, 'readByNotebook']);
  router.get(':id', [NotebooksController, 'read']);
  router.put(':id/notes/', [NotesController, 'updateByNotebook']);
  router.put(':id', [NotebooksController, 'update']);
  router.delete(':id/notes/', [NotesController, 'deleteByNotebook']);
  router.delete(':id', [NotebooksController, 'delete']);

}).prefix('notebook').use(middleware.auth());

router.group(() => {

  router.post('', [NotesController, 'create']);
  router.get(':id', [NotesController, 'read']);
  router.put(':id', [NotesController, 'update']);
  router.delete(':id', [NotesController, 'delete']);

}).prefix('note').use(middleware.auth());

router.group(() => {

  router.post('', [UsersController, 'create']); // THIS IS NECESSARILY UNAUTHENTICATED
  router.get(':id/notebooks/', [NotebooksController, 'readByUser']).use(middleware.auth());
  router.get(':id', [UsersController, 'read']).use(middleware.auth());
  router.put(':id', [UsersController, 'update']).use(middleware.auth());
  router.delete(':id', [UsersController, 'delete']).use(middleware.auth());

}).prefix('user');

router.group(() => {

  router.post('', [SessionsController, 'create']);
  router.delete('', [SessionsController, 'delete']);

}).prefix('session');

router.get('', ({ response }) => {
  response.send({ result: 'ok', message: 'Welcome to a JSON API. Try the /notebook/<id> endpoint after the POST /session/ (email, password) endpoint.' });
});
