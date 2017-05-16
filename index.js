// NodeJS - Core modules
const Emitter   = require('events');

// Dependencies modules
const uws       = require('uws');

// Internal modules
const Utils         = require('./core/utils.js');
const Middleware    = require('./core/middleware.js');
const Router        = require('./core/router.js');

/*
 * Server interfaces
 */ 
const IHTTPServerListen = {
    port: void 0
}

/*
 * Server server
 */
class HttpServer extends Middleware {

    constructor(opts) {
        super();
        this.error404 = Buffer.from('ERROR 404 - PAGE NOT FOUND');
        if(opts != void 0) {
            this.listen(opts);
        }
    }

    async _httpRequestHandler(request,response) {
        console.log(response);
        try {
            await this.run(request,response,{});
        }
        catch(Err) {
            this.emit('error',Err);
            response.writeHead(500, {'Content-Type': 'text/plain'});
            response.end(Buffer.from('Internal server error!'));
        }
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end(this.error404);
    }

    listen(opts) {
        if(this._uws !== undefined) return;
        opts = Utils.assignInterface(opts,IHTTPServerListen);
        if(opts.port == void 0) {
            throw new Error("Please provide a port to start the Http server!");
        }
        this._uws = uws.http.createServer( this._httpRequestHandler.bind(this) );
        this._uws.listen(opts.port);
        this._uws.on('error', (err) => {
            this.emit('error',err);
        });
    }

}

/*
 * WebSocket interface
 */    
const IWSSConstructor = {
    port: void 0
}

/*
 * WebSocket server
 */
class WebSocketServer extends Emitter {

    constructor(opts) {
        super();
        opts = Utils.assignInterface(opts,IWSSConstructor);
        if(opts.port == void 0) {
            throw new Error("Please provide a port to start the WebSocket server!");
        }
        this._WSServer = new uws.Server(opts);
        this._WSServer.on('connection',(ws) => {
            this.emit('connection',ws);
            ws.on('message',this.onMessage.bind(this));
        });
    }

    onMessage(message) {
        this.emit('')
    }
    
}

/*
 * Exports modules
 */ 
module.exports = {
    HttpServer,
    Middleware,
    Router
}