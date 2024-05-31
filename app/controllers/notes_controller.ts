import type { HttpContext } from '@adonisjs/core/http';
// import { errors } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';

import Note from '#models/note';
import {
	createNoteValidator,
	updateNoteValidator,
	updateArrayNotesValidator
} from '#validators/note';

export default class NotesController {

	// We will use a Bouncer to ensure that the logged-in user is allowed to create a note that relates to the provided notebookId.
	// The createNoteValidator() will ensure that the provided notebookId exists in the database. NOTE: may be redundant if Bouncer operates first.
	async create(ctx: HttpContext) {
		const note = new Note();
		const payload = await ctx.request.validateUsing(createNoteValidator);

		await note.merge(payload).save();

		ctx.response.send({ result: 'ok', note });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to view the specified record.
	async read(ctx: HttpContext) {
		const note = await Note.findOrFail(ctx.request.param('id'));

		ctx.response.send({ result: 'ok', note });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to view the records related to the supplied notebookId.
	async readByNotebook(ctx: HttpContext) {
		const notes = await Note.findManyBy('notebookId', ctx.request.param('id'));

		ctx.response.send({ result: 'ok', notes });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to update the specified record.
	// The updateNoteValidator() will ensure that the provided notebookId exists in the database. NOTE: may be redundant if Bouncer operates first.
	async update(ctx: HttpContext) {
		const note = await Note.findOrFail(ctx.request.param('id'));
		const payload = await ctx.request.validateUsing(updateNoteValidator);

		await note.merge(payload).save();

		ctx.response.send({ result: 'ok', note });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to replace all records for the supplied notebookId.
	async updateByNotebook(ctx: HttpContext) {
		const notes = await Note.findManyBy('notebookId', ctx.request.param('id'));
		const payload = await ctx.request.validateUsing(updateArrayNotesValidator);
		const trx = await db.transaction();

		try {
			for (let note of notes) {
				note.useTransaction(trx);
				await note.delete();
			}
			for (let newNote of payload.notes) {
				let note = new Note();
				await note.merge(newNote).save();
			}
			await trx.commit();
		} catch (e) {
			await trx.rollback();
			throw e;
		}

		const returnNotes = await Note.findManyBy('notebookId', ctx.request.param('id'));
		ctx.response.send({ result: 'ok', notes: returnNotes });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to delete the specified record.
	async delete(ctx: HttpContext) {
		const note = await Note.findOrFail(ctx.request.param('id'));

		await note.delete();

		ctx.response.send({ result: 'ok', id: ctx.request.param('id') });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to delete the records related to the supplied notebookId.
	async deleteByNotebook(ctx: HttpContext) {
		const notes = await Note.findManyBy('notebookId', ctx.request.param('id'));
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

		ctx.response.send({ result: 'ok', notes });
	};

};
