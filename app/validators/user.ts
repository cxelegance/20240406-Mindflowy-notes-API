import vine from '@vinejs/vine';

const fields = {
	email: vine.string().trim().unique(async (db, value) => {
		const user = await db
			.from('users')
			.where('email', value)
			.first();
		return !user;
	}),
	password: vine.string(),
	fullName: vine.string().trim()
};

export const userSchema = vine.object({
	email: fields.email,
	password: fields.password,
	fullName: fields.fullName.nullable().optional()
});

export const createUserValidator = vine.compile(
	userSchema
);

export const updateUserValidator = vine.withMetaData<{ userId: number }>().compile(
	vine.object({
		email: vine.string().trim().unique(async (db, value, field) => {
			const user = await db
				.from('users')
				.whereNot('id', field.meta.userId)
				.where('email', value)
				.first();
			return !user;
		}).nullable().optional(),
		password: fields.password.nullable().optional(),
		fullName: fields.fullName.nullable().optional()
	})
);
