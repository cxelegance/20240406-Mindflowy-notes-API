import type { HttpContext } from '@adonisjs/core/http';
// import { errors } from '@adonisjs/core';

import Notebook from '#models/notebook';
import {
	createNotebookValidator,
	updateNotebookValidator
} from '#validators/notebook';

import NotebookPolicy from '#policies/notebook_policy';

export default class NotebooksController {

	async create(ctx: HttpContext) {
		const notebook = new Notebook();
		const payload = await ctx.request.validateUsing(createNotebookValidator);

		if (await ctx.bouncer.with(NotebookPolicy).denies('create', payload.userId)) {
			ctx.response.abort({ message: 'Not allowed to create notebook' }, 403);
		}

		await notebook.merge(payload).save();

		ctx.response.jSend({ data: { notebook } });
	};

	async read(ctx: HttpContext) {
		const notebook = await Notebook.findOrFail(ctx.request.param('id'));

		if (await ctx.bouncer.with(NotebookPolicy).denies('read', notebook.userId)) {
			ctx.response.abort({ message: 'Not allowed to view notebook' }, 403);
		}

		ctx.response.jSend({ data: { notebook } });
	};

	async readByUser(ctx: HttpContext) {
		const user = ctx.request.comesWith.user;
		const notebooks = await Notebook.findManyBy('userId', user.id);

		if (notebooks.length && await ctx.bouncer.with(NotebookPolicy).denies('read', notebooks[0].userId)) {
			ctx.response.abort({ message: 'Not allowed to view notebooks' }, 403);
		}

		ctx.response.jSend({ data: { notebooks } });
	};

	async update(ctx: HttpContext) {
		const notebook = await Notebook.findOrFail(ctx.request.param('id'));

		if (await ctx.bouncer.with(NotebookPolicy).denies('edit', notebook.userId)) {
			ctx.response.abort({ message: 'Not allowed to update notebook' }, 403);
		}

		const payload = await ctx.request.validateUsing(updateNotebookValidator);

		await notebook.merge(payload).save();

		ctx.response.jSend({ data: { notebook } });
	};

	async delete(ctx: HttpContext) {
		const notebook = await Notebook.findOrFail(ctx.request.param('id'));

		if (await ctx.bouncer.with(NotebookPolicy).denies('delete', notebook.userId)) {
			ctx.response.abort({ message: 'Not allowed to delete notebook' }, 403);
		}

		await notebook.delete();

		ctx.response.jSend({ data: null });
	};

};
