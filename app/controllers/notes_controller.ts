import type { HttpContext } from '@adonisjs/core/http';
// import { errors } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';

import Note from '#models/note';
import Notebook from '#models/notebook';
import {
	createNoteValidator,
	sameNotebookValidator,
	updateNoteValidator
	// updateArrayNotesValidator
} from '#validators/note';

import NotePolicy from '#policies/note_policy';

export default class NotesController {

	async create(ctx: HttpContext) {
		const note = new Note();
		const payload = await ctx.request.validateUsing(createNoteValidator);
		const notebook = await Notebook.findOrFail(payload.notebookId);
		await ctx.request.validateUsing(sameNotebookValidator,
			{
				meta: {
					notebookId: notebook.id
				}
			}
		);

		if (await ctx.bouncer.with(NotePolicy).denies('create', notebook.userId, payload.notebookId, notebook.id)) {
			ctx.response.abort({ message: 'Not allowed to create in notebook' }, 403);
		}

		await note.merge(payload).save();

		ctx.response.jSend({ data: { note } });
	};

	async read(ctx: HttpContext) {
		const note = await Note.findOrFail(ctx.request.param('id'));
		const notebook = await Notebook.findOrFail(note.notebookId);

		if (await ctx.bouncer.with(NotePolicy).denies('read', notebook.userId, note.notebookId, notebook.id)) {
			ctx.response.abort({ message: 'Not allowed to read this note' }, 403);
		}

		ctx.response.jSend({ data: { note } });
	};

	async readByNotebook(ctx: HttpContext) {
		const notebook = ctx.request.comesWith.notebook;
		const notes = await Note.findManyBy('notebookId', notebook.id);

		if (await ctx.bouncer.with(NotePolicy).denies('read', notebook.userId, notebook.id, notebook.id)) {
			ctx.response.abort({ message: 'Not allowed to read notes in this notebook' }, 403);
		}

		ctx.response.jSend({ data: { notes } });
	};

	async update(ctx: HttpContext) {
		const note = await Note.findOrFail(ctx.request.param('id'));
		const payload = await ctx.request.validateUsing(updateNoteValidator);
		const notebook = await Notebook.findOrFail(payload.notebookId || note.notebookId);
		await ctx.request.validateUsing(sameNotebookValidator,
			{
				meta: {
					notebookId: notebook.id
				}
			}
		);

		if (await ctx.bouncer.with(NotePolicy).denies('edit', notebook.userId, note.notebookId, note.notebookId)) {
			ctx.response.abort({ message: 'Not allowed to put notes in this notebook' }, 403);
		}

		if (await ctx.bouncer.with(NotePolicy).denies('edit', notebook.userId, note.notebookId, notebook.id)) {
			ctx.response.abort({ message: 'Not allowed to update this note' }, 403);
		}

		await note.merge(payload).save();

		ctx.response.jSend({ data: { note } });
	};

	async updateByNotebook(ctx: HttpContext) {
		ctx.response.abort({ message: 'Route temporarily unavailable' }, 404); // TODO: implement or delete; needs validators and bouncers
		// const notes = await Note.findManyBy('notebookId', ctx.request.param('id'));
		// const payload = await ctx.request.validateUsing(updateArrayNotesValidator);
		// const trx = await db.transaction();

		// try {
		// 	for (let note of notes) {
		// 		note.useTransaction(trx);
		// 		await note.delete();
		// 	}
		// 	for (let newNote of payload.notes) {
		// 		let note = new Note();
		// 		await note.merge(newNote).save();
		// 	}
		// 	await trx.commit();
		// } catch (e) {
		// 	await trx.rollback();
		// 	throw e;
		// }

		// const returnNotes = await Note.findManyBy('notebookId', ctx.request.param('id'));
		// ctx.response.send({ result: 'ok', notes: returnNotes });
	};

	async delete(ctx: HttpContext) {
		const note = await Note.findOrFail(ctx.request.param('id'));
		const notebook = await Notebook.findOrFail(note.notebookId);

		if (await ctx.bouncer.with(NotePolicy).denies('delete', notebook.userId, note.notebookId, notebook.id)) {
			ctx.response.abort({ message: 'Not allowed to delete this note' }, 403);
		}

		await note.delete();

		ctx.response.jSend({ data: null });
	};

	async deleteByNotebook(ctx: HttpContext) {
		const notebook = ctx.request.comesWith.notebook;
		const notes = await Note.findManyBy('notebookId', notebook.id);

		if (await ctx.bouncer.with(NotePolicy).denies('delete', notebook.userId, notebook.id, notebook.id)) {
			ctx.response.abort({ message: 'Not allowed to delete notes in this notebook' }, 403);
		}

		const trx = await db.transaction();

		try {
			for (let note of notes) {
				note.useTransaction(trx);
				await note.delete();
			}
			await trx.commit();
		} catch (e) {
			await trx.rollback();
			throw e;
		}

		ctx.response.jSend({ data: null });
	};

};
