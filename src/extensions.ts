import { Request, Response } from '@adonisjs/core/http';
import User from '#models/user';
import Notebook from '#models/notebook';
import { jSendParam, jSend } from '#types/jSend';

// https://docs.adonisjs.com/guides/concepts/extending-adonisjs
// https://docs.adonisjs.com/guides/basics/request#extending-request-class
// https://github.com/orgs/adonisjs/discussions/4512
// https://github.com/poppinss/macroable

declare module '@adonisjs/core/http' {
  interface Request {
    hasUser: Promise<User>,
    hasNotebook: Promise<Notebook>,
    comesWith: {
      user: User | null,
      notebook: Notebook | null
    }
  }

  interface Response {
    jSend(): void
  }
};

Request.getter(
  'hasUser',
  function (this: Request) {
    return User.findOrFail(this.param('id'));
  },
  true
);

Request.getter(
  'hasNotebook',
  function (this: Request) {
    return Notebook.findOrFail(this.param('id'));
  },
  true
);

Request.getter(
  'comesWith',
  function (this: Request) {
    return {
      user: null,
      notebook: null
    };
  },
  true
);

Response.macro(
  'jSend',
  function (this: Response, { status = 'success', message, data }: jSendParam): void {
    if (message) return this.send(<jSend>{ status, message, data });
    else return this.send(<jSend>{ status, data });
  }
);
