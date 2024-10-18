import User from '#models/user';
import { BasePolicy } from '@adonisjs/bouncer';
import { AuthorizerResponse } from '@adonisjs/bouncer/types';
import env from '#start/env';

const aSuperUsers: string[] = env.get('SUPERUSERS').split(',');

export default class UserPolicy extends BasePolicy {

	async before(user: User, action: String, userId: Number) {
		return user.id === userId || aSuperUsers.indexOf(user.email) > -1;
	}

	read(user: User, userId: Number): AuthorizerResponse {
		return false;
	}

	edit(user: User, userId: Number): AuthorizerResponse {
		return false;
	}

	delete(user: User, userId: Number): AuthorizerResponse {
		return false;
	}

}
