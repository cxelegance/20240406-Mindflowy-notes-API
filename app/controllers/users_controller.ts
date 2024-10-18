import type { HttpContext } from '@adonisjs/core/http';
// import { errors } from '@adonisjs/core';

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

		ctx.response.send({ result: 'ok', user });
	};

	async read(ctx: HttpContext) {
		const user = await User.findOrFail(ctx.request.param('id'));

		if (await ctx.bouncer.with(UserPolicy).denies('read', user.id)) {
			ctx.response.abort({ message: 'Not allowed to view user', status: 403 }, 403);
		}

		ctx.response.send({ result: 'ok', user });
	};

	async update(ctx: HttpContext) {
		const user = await User.findOrFail(ctx.request.param('id'));

		if (await ctx.bouncer.with(UserPolicy).denies('edit', user.id)) {
			ctx.response.abort({ message: 'Not allowed to edit user', status: 403 }, 403);
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

		ctx.response.send({ result: 'ok', user });
	};

	async delete(ctx: HttpContext) {
		const user = await User.findOrFail(ctx.request.param('id'));

		if (await ctx.bouncer.with(UserPolicy).denies('delete', user.id)) {
			ctx.response.abort({ message: 'Not allowed to delete user', status: 403 }, 403);
		}

		await user.delete();

		ctx.response.send({ result: 'ok', id: ctx.request.param('id') });
	};

}
