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

router.group(() => {

  router.post('', [NotebooksController, 'create']);
  router.get(':id/notes/', [NotesController, 'readByNotebook']);
  router.get(':id', [NotebooksController, 'read']);
  // router.put(':id/notes/', [NotesController, 'updateByNotebook']); // TODO: requires a commit of its own
  router.put(':id', [NotebooksController, 'update']);
  router.delete(':id/notes/', [NotesController, 'deleteByNotebook']);
  router.delete(':id', [NotebooksController, 'delete']);

}).prefix('notebook');

router.group(() => {

  router.post('', [NotesController, 'create']);
  router.get(':id', [NotesController, 'read']);
  router.put(':id', [NotesController, 'update']);
  router.delete(':id', [NotesController, 'delete']);

}).prefix('note');

router.group(() => {

  router.post('', [UsersController, 'create']); // TODO: this is the only route that does NOT require authenticated user
  router.get(':id/notebooks/', [NotebooksController, 'readByUser']);
  router.get(':id', [UsersController, 'read']);
  router.put(':id', [UsersController, 'update']);
  router.delete(':id', [UsersController, 'delete']);

}).prefix('user');

router.get('', ({response}) => {
  response.send({ result: 'ok', message: 'Welcome to a JSON API. Try the /notebook/<id> endpoint.' });
});
