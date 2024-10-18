import type { HttpContext } from '@adonisjs/core/http';
import User from '#models/user';

export default class SessionsController {

	async create(ctx: HttpContext) {
		const { email, password } = ctx.request.only(['email', 'password']);
		const user = await User.verifyCredentials(email, password);
		await ctx.auth.use('web').login(user);
		ctx.response.send({ result: 'ok', user });
	}

	async delete(ctx: HttpContext) {
		await ctx.auth.use('web').logout();
		ctx.response.send({ result: 'ok' });
	}
}
