const events    = require('events');
const { each }  = require('async');

class Package extends events {

    constructor() {
        super();
        this.context    = {};
        this.callbacks  = [];
        this.packages   = [];
    }

    getContext() {
        return Object.assign({},this.context);
    }

    setVar(strName,value) {
        if(typeof strName !== "string") {
            throw new TypeError("strName have to be a String");
        }
        this.context[strName] = value;
    }

    getVar(strName) {
        return Reflect.has(this.context,strName) ? Reflect.get(this.context,strName) : null;
    }

    delVar(strName) {
        if(Reflect.has(this.context,strName)) {
            Reflect.deleteProperty(this.context,strName);
        }
    }

    use(objMiddleware) {
        if(objMiddleware instanceof Package) {
            this.packages.push(objMiddleware);
        }
        else if(typeof objMiddleware === 'function') {
            this.callbacks.push(objMiddleware);
        }
        else {
            throw new TypeError("Unsupported middleware type for objMiddleware");
        }
    }

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

    async run(middlewareContext,tContext) {
        let reqContext = tContext != void 0 ? Object.assign(tContext,this.getContext()) : this.getContext();

        if(middlewareContext != void 0) {
            Object.assign(reqContext,middlewareContext);
        }

        await this._executeCallbacks(reqContext);
        await this._runChildrenPackages(reqContext);
    }

}

module.exports = Package;