const Emitter    = require('events');
const { each }   = require('async');

/*
 * Package class 
 * Middleware component with his own Context, Callback(s) and Package(s).
 */
class Package extends Emitter {

    constructor() {
        super();
        this.context     = {};
        this._callbacks  = [];
        this._packages   = [];
    }

    /*
     * Copy package context
     */
    copyContext() {
        return Object.assign({},this.context);
    }

    /*
     * Use a new middleware element.
     */
    use(objMiddleware) {
        if(objMiddleware instanceof Package) {
            this.emit('use',objMiddleware);
            this._packages.push(objMiddleware);
        }
        else if(typeof objMiddleware === 'function') {
            this._callbacks.push(objMiddleware);
        }
        else {
            throw new TypeError("Unsupported middleware type for objMiddleware");
        }
    }

    /*
     * execute package callback(s).
     */
    async _executeCallbacks(ctx) {
        var i = 0,len = this._callbacks.length;
        for(;i<len;i++) {
            try {
                await this._callbacks[i](ctx);
            }
            catch(Exception) {
                throw Exception;
            }
        }
    }

    /*
     * Run middleware execution for every package(s) attached.
     */
    _runChildrenPackages(context) {
        return new Promise((resolve,reject) => {
            each(this._packages,(pkg,next) => {
                pkg.run(void 0,context).then( next ).catch( err => {
                    next();
                });
            },(err) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }

    /*
     * Run middleware execution
     */
    async run(middlewareContext,tContext) {
        const selfCtx   = this.copyContext();
        let reqContext  = tContext != void 0 ? Object.assign(tContext,selfCtx) : selfCtx;

        if(middlewareContext != void 0) {
            Object.assign(reqContext,middlewareContext);
        }

        if(this._callbacks.length > 0) {
            await this._executeCallbacks(reqContext);
        }
        if(this._packages.length > 0) {
            await this._runChildrenPackages(reqContext);
        }
    }

}

module.exports = Package;