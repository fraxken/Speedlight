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
     * Unsafe use of package(s).
     */
    unsafe_usePackage(pkg) {
        this.emit('use',pkg);
        this._packages.push(pkg);
    }

    /*
     * execute package callback(s).
     */
    async _executeCallbacks(request,response,context) {
        var i = 0,len = this._callbacks.length;
        for(;i<len;i++) {
            try {
                await this._callbacks[i](request,response,context);
            }
            catch(Exception) {
                throw Exception;
            }
        }
    }

    /*
     * Run middleware execution for every package(s) attached.
     */
    _runChildrenPackages(request,response,context) {
        return new Promise((resolve,reject) => {
            each(this._packages,(pkg,next) => {
                pkg.run(request,response,context).then( next ).catch( err => {
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
    async run(request,response,inheritContext) {
        let scopeContext  = Object.assign(inheritContext,this.copyContext());

        if(this._callbacks.length > 0) 
            await this._executeCallbacks(request,response,scopeContext);
        if(this._packages.length > 0) 
            await this._runChildrenPackages(request,response,scopeContext);
    }

}

module.exports = Package;