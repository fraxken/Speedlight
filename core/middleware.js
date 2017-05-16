const Emitter    = require('events');
const { each }   = require('async');

/*
 * Package class 
 * Middleware component with his own Context, Callback(s) and Package(s).
 */
class Middleware extends Emitter {

    constructor() {
        super();
        this.context = {};
        this._requestsHandler = [];
        this._responseHandler = [];
        this._middleware = [];
    }

    /*
     * Copy package context
     */
    copyContext() {
        return Object.assign({},this.context);
    }

    /*
     * Extend middleware
     */
    extend(middleware) {
        if(middleware instanceof Middleware === false) {
            throw new TypeError("Not a middleware object!");
        }
        this.emit('use',middleware);
        this._middleware.push(middleware);
    }

    /*
     * append new Request handler!
     */
    appendRequestHandler(handler) {
        if(typeof handler !== 'function') {
            throw new TypeError("handler is not a function");
        }
        this._requestsHandler.push(handler);
    }

    /*
     * append new Response handler!
     */
    appendResponseHandler(handler) {
        if(typeof handler !== 'function') {
            throw new TypeError("handler is not a function");
        }
        this._responseHandler.push(handler);
    }

    /*
     * execute package callback(s).
     */
    async _assignRequestHandler(request,response,context) {
        var i = 0,len = this._requestsHandler.length;
        for(;i<len;i++) {
            try {
                await this._requestsHandler[i](request,response,context);
            }
            catch(Exception) {
                throw Exception;
            }
        }
    }

    /*
     * Run middleware execution for every package(s) attached.
     */
    _executeChildrenMiddleware(request,response,context) {
        return new Promise((resolve,reject) => {
            each(this._middleware,(middleware,next) => {
                middleware.run(request,response,context).then( next ).catch( err => {
                    this.emit('error',err);
                    next();
                });
            },(err) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    /*
     * Run middleware execution
     */
    async run(request,response,inheritContext) {
        let scopeContext  = Object.assign(inheritContext,this.copyContext());

        if(this._requestsHandler.length > 0) {
            await this._assignRequestHandler(request,response,scopeContext);
        }

        if(this._responseHandler.length > 0) {
            this._responseHandler.forEach( fn => response.on('finish',async () => {
                await fn(scopeContext);
            }));
        }

        if(this._middleware.length > 0) 
            await this._executeChildrenMiddleware(request,response,scopeContext);
    }

}

module.exports = Middleware;