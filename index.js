// NodeJS - Core modules
const Emitter   = require('events');

// Dependencies modules
const uws       = require('uws');

// Internal modules
const Utils     = require('./core/utils.js');
const Package   = require('./core/package.js');
const Router    = require('./core/router.js');

/*
 * Server interfaces
 */ 
const IHTTPServerListen = {
    port: void 0
}

/*
 * Server server
 */
class HttpServer extends Package {

    constructor(opts) {
        super();
        if(opts != void 0) {
            this.listen(opts);
        }
    }

    async _httpRequestHandler(request,response) {
        await this.run(request,response,{});
        response.end(Buffer.from('Unmatched routes!'));
    }

    listen(opts) {
        if(this._httpServer !== undefined) return;
        opts = Utils.assignInterface(opts,IHTTPServerListen);
        if(opts.port == void 0) {
            throw new Error("Please provide a port to start the Http server!");
        }
        this._httpServer = uws.http.createServer( this._httpRequestHandler.bind(this) );
        this._httpServer.listen(opts.port);
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
    Package,
    Router
}