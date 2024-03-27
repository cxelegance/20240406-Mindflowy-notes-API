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

router.group(() => {

  router.post('', [MindstacksController, 'create']);
  router.get(':id', [MindstacksController, 'read']);
  router.put(':id', [MindstacksController, 'update']);
  router.delete(':id', [MindstacksController, 'delete']);

}).prefix('mindstack');
