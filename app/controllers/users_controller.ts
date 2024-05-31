import type { HttpContext } from '@adonisjs/core/http';
// import { errors } from '@adonisjs/core';

import User from '#models/user';
import {
	createUserValidator,
	updateUserValidator
} from '#validators/user';

export default class UsersController {

	// This is meant to be wide open; anyone can create a user.
	// The createUserValidator() will ensure that the provided email does not belong to any existing user.
	async create(ctx: HttpContext) {
		const payload = await ctx.request.validateUsing(createUserValidator);
		const user = new User();

		await user.merge(payload).save();

		ctx.response.send({ result: 'ok', user });
	};

	//  We will use a Bouncer to ensure that the logged-in user is allowed to view the specified record.
	async read(ctx: HttpContext) {
		const user = await User.findOrFail(ctx.request.param('id'));

		ctx.response.send({ result: 'ok', user });
	};

	// We will use a Bouncer to ensure that the logged-in user is allowed to update the specified record.
	// The updateUserValidator() will ensure that the provided email does not belong to any existing user (except than the logged-in user).
	async update(ctx: HttpContext) {
		const user = await User.findOrFail(ctx.request.param('id'));
		const payload = await ctx.request.validateUsing(updateUserValidator,
			{
				meta: {
					userId: ctx.request.qs().loggedInUserId // replace with auth user
				}
			}
		);

		await user.merge(payload).save();

		ctx.response.send({ result: 'ok', user });
	};

	//  We will use a Bouncer to ensure that the logged-in user is allowed to delete the specified record.
	async delete(ctx: HttpContext) {
		const user = await User.findOrFail(ctx.request.param('id'));

		await user.delete();

		ctx.response.send({ result: 'ok', id: ctx.request.param('id') });
	};

}
