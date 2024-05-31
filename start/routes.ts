/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router';
import MindstacksController from '#controllers/mindstacks_controller';
import NotesController from '#controllers/notes_controller';
import UsersController from '#controllers/users_controller';

router.group(() => {

  router.post('', [MindstacksController, 'create']);
  router.get(':id/notes/', [NotesController, 'readByMindstack']);
  router.get(':id', [MindstacksController, 'read']);
  // router.put(':id/notes/', [NotesController, 'updateByMindstack']); // TODO: requires a commit of its own
  router.put(':id', [MindstacksController, 'update']);
  router.delete(':id/notes/', [NotesController, 'deleteByMindstack']);
  router.delete(':id', [MindstacksController, 'delete']);

}).prefix('mindstack');

router.group(() => {

  router.post('', [NotesController, 'create']);
  router.get(':id', [NotesController, 'read']);
  router.put(':id', [NotesController, 'update']);
  router.delete(':id', [NotesController, 'delete']);

}).prefix('note');

router.group(() => {

  router.post('', [UsersController, 'create']); // TODO: this is the only route that does NOT require authenticated user
  router.get(':id/mindstacks/', [MindstacksController, 'readByUser']);
  router.get(':id', [UsersController, 'read']);
  router.put(':id', [UsersController, 'update']);
  router.delete(':id', [UsersController, 'delete']);

}).prefix('user');

router.get('', ({response}) => {
  response.send({ result: 'ok', message: 'Welcome to a JSON API. Try the /mindstack/<id> endpoint.' });
});
