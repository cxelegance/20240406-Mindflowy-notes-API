import type { HttpContext } from '@adonisjs/core/http';

import User from '#models/user';
import {
	createUserValidator,
	updateUserValidator
} from '#validators/user';

import UserPolicy from '#policies/user_policy';

export default class UsersController {

	// This method is meant to be wide open; anyone (logged in or not) can create a user.
	async create(ctx: HttpContext) {
		const payload = await ctx.request.validateUsing(createUserValidator);
		const user = new User();

		await user.merge(payload).save();

		ctx.response.jSend({ data: { user } });
	};

	async read(ctx: HttpContext) {
		const user = await User.findOrFail(ctx.request.param('id'));

		if (await ctx.bouncer.with(UserPolicy).denies('read', user.id)) {
			ctx.response.abort({ message: 'Not allowed to view user' }, 403);
		}

		ctx.response.jSend({ data: { user } });
	};

	async update(ctx: HttpContext) {
		const user = await User.findOrFail(ctx.request.param('id'));

		if (await ctx.bouncer.with(UserPolicy).denies('edit', user.id)) {
			ctx.response.abort({ message: 'Not allowed to edit user' }, 403);
		}

		const userId = user.id;
		const payload = await ctx.request.validateUsing(updateUserValidator,
			{
				meta: {
					userId
				}
			}
		);

		await user.merge(payload).save();

		ctx.response.jSend({ data: { user } });
	};

	async delete(ctx: HttpContext) {
		const user = await User.findOrFail(ctx.request.param('id'));

		if (await ctx.bouncer.with(UserPolicy).denies('delete', user.id)) {
			ctx.response.abort({ message: 'Not allowed to delete user' }, 403);
		}

		await user.delete();

		ctx.response.jSend({ data: null });
	};

}
