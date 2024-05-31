import type { HttpContext } from '@adonisjs/core/http';
// import { errors } from '@adonisjs/core';

import Notebook from '#models/notebook';
import {
	createNotebookValidator,
	updateNotebookValidator
} from '#validators/notebook';

export default class NotebooksController {

	// The createNotebookValidator() will ensure that the payload userId matches that of the logged-in user,
	// i.e., a user cannot create a notebook for another user.
	async create(ctx: HttpContext) {
		const notebook = new Notebook();
		const payload = await ctx.request.validateUsing(createNotebookValidator,
			{
				meta: {
					userId: ctx.request.qs().loggedInUserId // replace with auth user
				}
			}
		);

		await notebook.merge(payload).save();

		ctx.response.send({ result: 'ok', notebook });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to view the specified record.
	async read(ctx: HttpContext) {
		const notebook = await Notebook.findOrFail(ctx.request.param('id'));

		ctx.response.send({ result: 'ok', notebook });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to view the records related to the supplied userId.
	async readByUser(ctx: HttpContext) {
		const notebooks = await Notebook.findManyBy('userId', ctx.request.param('id'));

		ctx.response.send({ result: 'ok', notebooks });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to update the specified record.
	// The updateNotebookValidator() will ensure that the payload userId exists in the database.
	async update(ctx: HttpContext) {
		const notebook = await Notebook.findOrFail(ctx.request.param('id'));
		const payload = await ctx.request.validateUsing(updateNotebookValidator);

		await notebook.merge(payload).save();

		ctx.response.send({ result: 'ok', notebook });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to delete the specified record.
	async delete(ctx: HttpContext) {
		const notebook = await Notebook.findOrFail(ctx.request.param('id'));

		await notebook.delete();

		ctx.response.send({ result: 'ok', id: ctx.request.param('id') });
	};

};
