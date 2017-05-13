const Package = require('./package.js');

class Router extends Package {

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
        this.use(async(ctx) => {
            const url        = ctx.request.url;
            const routingMap = this._routes[ctx.request.method];

            if(routingMap.has(url)) {
                try {
                    await routingMap.get(url)(ctx);
                }
                catch(Err) {
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

    registerRoute(strMethod,asyncMethod) {
        if(Reflect.has(this._routes,strMethod) === false) {
            throw new Error('strMethod have to be equal to : GET|POST|PUT');
        }
        if(asyncMethod === undefined) {
            throw new Error('Invalid method');
        }
        process.nextTick(() => {
            let tBasePath = this.basePath;
            if(tBasePath[tBasePath.length - 1] !== '/') {
                tBasePath = tBasePath+'/';
            }
            const methodURI = tBasePath+asyncMethod.name;
            console.log(`Declare new route => ${methodURI}`);
            this._routes[strMethod].set(methodURI,asyncMethod);
        });
    }

}

module.exports = Router;