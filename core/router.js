const Middleware = require('./middleware.js');

class Router extends Middleware {

    constructor(strBasename) {
        super();

        this.basePath = strBasename == void 0 ? '/' : strBasename;
        if(this.basePath[0] !== '/') {
            this.basePath = '/'+this.basePath;
        }

        this._routes = {
            GET:    new Map(),
            POST:   new Map(),
            PUT:    new Map()
        };

        this.on('use', (pkg) => pkg.setBase(this.basePath) );
        this.appendRequestHandler(async(request,response,ctx) => {
            const url        = request.url;
            const routingMap = this._routes[request.method];

            if(routingMap.has(url)) {
                try {
                    await routingMap.get(url)(request,response,ctx);
                }
                catch(Err) {
                    console.log('err');
                    throw Err;
                }
            }
        });
    }

    setBase(strPath) {
        if(strPath === '/') return;
        if(typeof strPath !== 'string') {
            throw new TypeError('Invalid type for strPath');
        }
        this.basePath = strPath+this.basePath;
    }

    get(...args) {
        this.handleMethod('GET',...args);
    }

    post(...args) {
        this.handleMethod('POST',...args);
    }

    handleMethod(strMethod,...arg) {
        if(Reflect.has(this._routes,strMethod) === false) {
            throw new Error('strMethod have to be equal to : GET|POST|PUT');
        }
        let methodName;
        let methodFN;

        if(arg.length === 1 && typeof arg[0] === 'function') {
            methodName  = arg[0].name;
            methodFN    = arg[0];
        }
        else if(arg.length === 2 && typeof arg[0] === 'string' && typeof arg[1] === 'function') {
            methodName  = arg[0];
            methodFN    = arg[1];
        }
        else {
            throw new TypeError("Invalid handleMethod argument!");
        }

        if(methodName[0] === '/') {
            methodName = methodName.substr(1);
        }
        
        process.nextTick(() => {
            let tBasePath = this.basePath;
            if(tBasePath[tBasePath.length - 1] !== '/') {
                tBasePath = tBasePath+'/';
            }
            const methodURI = tBasePath+methodName;
            console.log(`Declare new route => ${methodURI}`);
            this._routes[strMethod].set(methodURI,methodFN);
        });
    }

}

module.exports = Router;