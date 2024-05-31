import vine from '@vinejs/vine';

const fields = {
	mindstackId: vine.number().unique(async (db, value) => {
		const mindstack = await db
			.from('mindstacks')
			.where('id', value)
			.first();
		return mindstack;
	}),
	prevSibling: vine.number(),
	parent: vine.number(),
	data: vine.string()
};

export const noteSchema = vine.object({
	mindstackId: fields.mindstackId,
	prevSibling: fields.prevSibling.nullable().optional(),
	parent: fields.parent.nullable().optional(),
	data: fields.data.optional()
});

export const createNoteValidator = vine.compile(
	noteSchema
);

export const updateNoteValidator = vine.compile(
	vine.object({
		mindstackId: fields.mindstackId.optional(),
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
				mindstackId: fields.mindstackId,
				prevSibling: fields.prevSibling.nullable(),
				parent: fields.parent.nullable(),
				data: fields.data.optional()
			})
		)
	})
);
