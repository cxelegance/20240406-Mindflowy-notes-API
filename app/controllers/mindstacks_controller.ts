import type { HttpContext } from '@adonisjs/core/http';

export default class MindstacksController {

	async create(ctx: HttpContext){
		ctx.response.send({ result: 'ok' });
	};

	async read(ctx: HttpContext){
		ctx.response.send({ result: 'ok', id: ctx.request.param('id') });
	};

	async update(ctx: HttpContext){
		ctx.response.send({ result: 'ok', id: ctx.request.param('id') });
	};

	async delete(ctx: HttpContext){
		ctx.response.send({ result: 'ok', id: ctx.request.param('id') });
	};

};
