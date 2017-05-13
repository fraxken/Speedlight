const events    = require('events');
const { each }  = require('async');

/*
 * Package class 
 * Middleware component with his own Context, Callback(s) and Package(s).
 */
class Package extends events {

    constructor() {
        super();
        this.context    = {};
        this.callbacks  = [];
        this.packages   = [];
    }

    /*
     * 
     */
    copyContext() {
        return Object.assign({},this.context);
    }

    /*
     * set a new context variable!
     */
    setVar(strName,value) {
        if(typeof strName !== "string") {
            throw new TypeError("strName have to be a String");
        }
        this.context[strName] = value;
    }

    /*
     * get a context variable!
     */
    getVar(strName) {
        return Reflect.has(this.context,strName) ? Reflect.get(this.context,strName) : null;
    }

    /*
     * delete a context variable!
     */
    delVar(strName) {
        if(Reflect.has(this.context,strName)) {
            Reflect.deleteProperty(this.context,strName);
        }
    }

    /*
     * Use a new middleware element.
     */
    use(objMiddleware) {
        if(objMiddleware instanceof Package) {
            this.emit('use',objMiddleware);
            this.packages.push(objMiddleware);
        }
        else if(typeof objMiddleware === 'function') {
            this.callbacks.push(objMiddleware);
        }
        else {
            throw new TypeError("Unsupported middleware type for objMiddleware");
        }
    }

    /*
     * execute package callback(s).
     */
    async _executeCallbacks(ctx) {
        var i = 0,len = this.callbacks.length;
        for(;i<len;i++) {
            try {
                await this.callbacks[i](ctx);
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
            each(this.packages,(pkg,next) => {
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

        await this._executeCallbacks(reqContext);
        await this._runChildrenPackages(reqContext);
    }

}

module.exports = Package;