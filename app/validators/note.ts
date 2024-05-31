import vine from '@vinejs/vine';

const fields = {
	notebookId: vine.number().unique(async (db, value) => {
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

export const updateArrayNotesValidator = vine.compile(
	vine.object({
		notes: vine.array(
			vine.object({
				// id: vine.number(),
				notebookId: fields.notebookId,
				prevSibling: fields.prevSibling.nullable(),
				parent: fields.parent.nullable(),
				data: fields.data.optional()
			})
		)
	})
);
