import vine from '@vinejs/vine';

const fields = {
	notebookId: vine.number().exists(async (db, value) => {
		const notebook = await db
			.from('notebooks')
			.where('id', value)
			.first();
		return notebook;
	}),
	prevSibling: vine.number(),
	parent: vine.number(),
	data: vine.string()
};

export const noteSchema = vine.object({
	notebookId: fields.notebookId,
	prevSibling: fields.prevSibling.nullable().optional(),
	parent: fields.parent.nullable().optional(),
	data: fields.data.optional()
});

export const createNoteValidator = vine.compile(
	noteSchema
);

export const updateNoteValidator = vine.compile(
	vine.object({
		notebookId: fields.notebookId.optional(),
		prevSibling: fields.prevSibling.nullable().optional(),
		parent: fields.parent.nullable().optional(),
		data: fields.data.optional()
	})
);

export const sameNotebookValidator = vine.withMetaData<{ notebookId: number }>().compile(
	vine.object({
		prevSibling: fields.prevSibling.exists(async (db, value, field) => {
			if (!value) return true;
			const note = await db
				.from('notes')
				.where('id', value)
				.where('notebook_id', field.meta.notebookId)
				.first();
			return note;
		}).nullable().optional(),
		parent: fields.parent.exists(async (db, value, field) => {
			if (!value) return true;
			const note = await db
				.from('notes')
				.where('id', value)
				.where('notebook_id', field.meta.notebookId)
				.first();
			return note;
		}).nullable().optional()
	})
);

// export const updateArrayNotesValidator = vine.compile( // TODO: delete if not using
// 	vine.object({
// 		notes: vine.array(
// 			vine.object({
// 				// id: vine.number(),
// 				notebookId: fields.notebookId,
// 				prevSibling: fields.prevSibling.nullable(),
// 				parent: fields.parent.nullable(),
// 				data: fields.data.optional()
// 			})
// 		)
// 	})
// );
