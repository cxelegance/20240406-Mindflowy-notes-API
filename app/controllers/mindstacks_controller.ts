import type { HttpContext } from '@adonisjs/core/http';
import { errors } from '@adonisjs/core';

import Mindstack from '#models/mindstack';
import Note from '#models/note'; // TODO: this is here temporarily; a Mindstack controller should not be manipulating other entities
import User from '#models/user'; // TODO: this is here temporarily; a Mindstack controller should not be manipulating other entities

export default class MindstacksController {

	async create(ctx: HttpContext){
		let user = await User.find(1);

		if (user === null) {
			user = new User();
			user.email = 'contact@cxelegance.com';
			user.password = 'thisShouldBeHashed';
			await user.save();
		}

		const mindstack = new Mindstack();
		mindstack.user_id = user.id;
		mindstack.name = 'my mindstack';
		mindstack.description = 'this is what a mindstack looks like';
		await mindstack.save();

		const note = new Note();
		note.mindstack_id = mindstack.id;
		note.data = 'this note should cascade delete when the mindstack deletes';
		await note.save();

		ctx.response.send({ result: 'ok', mindstackId: mindstack.id });
	};

	async read(ctx: HttpContext){
		const mindstack = await Mindstack.find(ctx.request.param('id'));

		if(mindstack === null) throw errors.E_ROUTE_NOT_FOUND;

		ctx.response.send({ result: 'ok', id: ctx.request.param('id'), mindstack });
	};

	async update(ctx: HttpContext){
		ctx.response.send({ result: 'ok', id: ctx.request.param('id') });
	};

	async delete(ctx: HttpContext){
		const mindstack = await Mindstack.find(ctx.request.param('id'));

		if(mindstack === null) throw errors.E_ROUTE_NOT_FOUND;

		await mindstack.delete();

		ctx.response.send({ result: 'ok', id: ctx.request.param('id') });
	};

};
