import { HttpError } from '@adonisjs/core/types/http';
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * Whether or not to render debug info. When set to true, the errors
   * will have the complete error stack.
   */
  protected debug: boolean = process.env.NODE_ENV === 'development'; // let's test production responses; only dev gets dev responses
  protected consoleDebug = false; // see all if(this.consoleDebug) console.debug in this class extension; set to true when needed

  /**
   * Handles the error during the HTTP request.
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (this.consoleDebug) console.debug(`my handle() has been called`)

    /**
     * Self handle exception: remove this functionality
     */
    if (typeof error.handle === 'function') {
      if (this.consoleDebug) console.debug(`has its own handle() function`)
      error.handle = undefined;
      if (this.consoleDebug) console.debug(`handle now is: ${error.handle}`)
    }

    return super.handle(error, ctx);
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }

  /**
   * Renders the validation error message to a JSON
   * response
   */
  async renderValidationErrorAsJSON(error: HttpError, ctx: HttpContext) {
    if (this.consoleDebug) console.debug(`my renderValidationErrorAsJSON() has been called`)
    return this.renderErrorAsjSend(error.messages, error, ctx);
  }

  /**
   * Renders an error to JSON response
   */
  async renderErrorAsJSON(error: HttpError, ctx: HttpContext) {
    if (this.consoleDebug) console.debug(`my renderErrorAsJSON() has been called`)
    let messages = error.messages || error.message || null;

    if (this.isDebuggingEnabled(ctx)) {
      if (this.consoleDebug) console.debug('debugging is enabled')
      const { default: Youch } = await import('youch')
      const json = await new Youch(error, ctx.request.request).toJSON()
      messages = json.error || messages;
    }
    if (this.consoleDebug) console.debug(messages)

    return this.renderErrorAsjSend(messages, error, ctx);
  }

  /**
   * Renders an error in the jSend format.
   */
  async renderErrorAsjSend(data: any | null, error: HttpError, ctx: HttpContext) {
    const code: number = parseInt(error.status, 10);
    if (code >= 500) {
      ctx.response.status(error.status).jSend({ status: 'error', message: 'please see data property for errors', data });
    } else {
      ctx.response.status(error.status).jSend({ status: 'fail', data });
    }
  }
}
