// NodeJS - Core modules
const events    = require('events');

// Dependencies modules
const uws       = require('uws');

// Internal modules
const Utils     = require('./core/utils.js');
const Package   = require('./core/package.js');
const Router    = require('./core/router.js');

/*
 * Server interfaces
 */ 
const IServerListen = {
    port: void 0
}

/*
 * Server class
 */
class Server extends Package {

    constructor(opts) {
        super();
        if(opts != void 0) {
            this.listen(opts);
        }
    }

    async _httpRequestHandler(request,response) {
        await this.run({ request, response },void 0);
        response.end(Buffer.from('Unmatched routes!'));
    }

    listen(opts) {
        if(this.httpServer !== undefined) return;
        opts = Utils.assignInterface(opts,IServerListen);
        if(opts.port == void 0) {
            throw new Error("Please provide a port to start the http server!");
        }
        this.httpServer = uws.http.createServer( this._httpRequestHandler.bind(this) );
        this.httpServer.listen(opts.port);
    }

}

/*
 * Exports modules
 */ 
module.exports = {
    Server,
    Package,
    Router
}