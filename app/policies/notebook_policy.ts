import User from '#models/user';
import { BasePolicy } from '@adonisjs/bouncer';
import { AuthorizerResponse } from '@adonisjs/bouncer/types';
import env from '#start/env';

const aSuperUsers: string[] = env.get('SUPERUSERS').split(',');

export default class NotebookPolicy extends BasePolicy {

	async before(user: User, action: String, notebookUserId: Number) {
		return user.id === notebookUserId || aSuperUsers.indexOf(user.email) > -1;
	}

	read(user: User, notebookUserId: Number): AuthorizerResponse {
		return false
	}

	create(user: User, notebookUserId: Number): AuthorizerResponse {
		return false
	}

	edit(user: User, notebookUserId: Number): AuthorizerResponse {
		return false;
	}

	delete(user: User, notebookUserId: Number): AuthorizerResponse {
		return false;
	}

}
