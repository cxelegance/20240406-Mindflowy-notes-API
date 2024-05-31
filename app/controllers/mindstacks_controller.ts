import type { HttpContext } from '@adonisjs/core/http';
// import { errors } from '@adonisjs/core';

import Mindstack from '#models/mindstack';
import {
	createMindstackValidator,
	updateMindstackValidator
} from '#validators/mindstack';

export default class MindstacksController {

	// The createMindstackValidator() will ensure that the payload userId matches that of the logged-in user,
	// i.e., a user cannot create a mindstack for another user.
	async create(ctx: HttpContext) {
		const mindstack = new Mindstack();
		const payload = await ctx.request.validateUsing(createMindstackValidator,
			{
				meta: {
					userId: ctx.request.qs().loggedInUserId // replace with auth user
				}
			}
		);

		await mindstack.merge(payload).save();

		ctx.response.send({ result: 'ok', mindstack });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to view the specified record.
	async read(ctx: HttpContext) {
		const mindstack = await Mindstack.findOrFail(ctx.request.param('id'));

		ctx.response.send({ result: 'ok', mindstack });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to view the records related to the supplied userId.
	async readByUser(ctx: HttpContext) {
		const mindstacks = await Mindstack.findManyBy('userId', ctx.request.param('id'));

		ctx.response.send({ result: 'ok', mindstacks });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to update the specified record.
	// The updateMindstackValidator() will ensure that the payload userId exists in the database.
	async update(ctx: HttpContext) {
		const mindstack = await Mindstack.findOrFail(ctx.request.param('id'));
		const payload = await ctx.request.validateUsing(updateMindstackValidator);

		await mindstack.merge(payload).save();

		ctx.response.send({ result: 'ok', mindstack });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to delete the specified record.
	async delete(ctx: HttpContext) {
		const mindstack = await Mindstack.findOrFail(ctx.request.param('id'));

		await mindstack.delete();

		ctx.response.send({ result: 'ok', id: ctx.request.param('id') });
	};

};
