import vine from '@vinejs/vine';

const fields = {
	userId: vine.number().exists(async (db, value, field) => {
		const user = await db
			.from('users')
			.where('id', field.meta.userId)
			.where('id', value)
			.first();
		return user;
	}),
	name: vine.string().trim(),
	description: vine.string().trim()
};

const vineWithMetaData = vine.withMetaData<{ userId: number }>();

export const mindstackSchema = vine.object({
	userId: fields.userId,
	name: fields.name,
	description: fields.description.nullable().optional()
});

export const createMindstackValidator = vineWithMetaData.compile(
	mindstackSchema
);

export const updateMindstackValidator = vineWithMetaData.compile(
	vine.object({
		userId: vine.number().exists(async (db, value) => {
			const user = await db
				.from('users')
				.where('id', value)
				.first();
			return user;
		}).optional(),
		name: fields.name.optional(),
		description: fields.description.nullable().optional()
	})
);
