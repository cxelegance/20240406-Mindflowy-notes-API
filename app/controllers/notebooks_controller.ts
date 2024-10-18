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
			ctx.response.abort({ message: 'Not allowed to create notebook', status: 403 }, 403);
		}

		await notebook.merge(payload).save();

		ctx.response.send({ result: 'ok', notebook });
	};

	async read(ctx: HttpContext) {
		const notebook = await Notebook.findOrFail(ctx.request.param('id'));

		if (await ctx.bouncer.with(NotebookPolicy).denies('read', notebook.userId)) {
			ctx.response.abort({ message: 'Not allowed to view notebook', status: 403 }, 403);
		}

		ctx.response.send({ result: 'ok', notebook });
	};

	async readByUser(ctx: HttpContext) {
		const notebooks = await Notebook.findManyBy('userId', ctx.request.param('id'));

		if (notebooks.length && await ctx.bouncer.with(NotebookPolicy).denies('read', notebooks[0].userId)) {
			ctx.response.abort({ message: 'Not allowed to view notebooks', status: 403 }, 403);
		}

		ctx.response.send({ result: 'ok', notebooks });
	};

	async update(ctx: HttpContext) {
		const notebook = await Notebook.findOrFail(ctx.request.param('id'));

		if (await ctx.bouncer.with(NotebookPolicy).denies('edit', notebook.userId)) {
			ctx.response.abort({ message: 'Not allowed to update notebook', status: 403 }, 403);
		}

		const payload = await ctx.request.validateUsing(updateNotebookValidator);

		await notebook.merge(payload).save();

		ctx.response.send({ result: 'ok', notebook });
	};

	async delete(ctx: HttpContext) {
		const notebook = await Notebook.findOrFail(ctx.request.param('id'));

		if (await ctx.bouncer.with(NotebookPolicy).denies('delete', notebook.userId)) {
			ctx.response.abort({ message: 'Not allowed to delete notebook', status: 403 }, 403);
		}

		await notebook.delete();

		ctx.response.send({ result: 'ok', id: ctx.request.param('id') });
	};

};
