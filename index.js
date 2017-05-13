// NodeJS - Core modules
const events    = require('events');

// Dependencies modules
const uws       = require('uws');
const async     = require('async');

// Internal modules
const Utils     = require('./core/utils.js');
const Package   = require('./core/package.js');

/*
 * Server interfaces
 */ 
const IServerListen = {
    port: 3000
}

/*
 * Server class
 */
class Server extends Package {

    constructor() {
        super("Speedlight-server");
    }

    async _httpRequestHandler(request,response) {

        console.log(`URL Requested << ${request.url} >>`);
        console.time('handle_http');

        await this.run({ request, response },void 0);

        response.end(Buffer.from('Unmatched routes!'));
        console.timeEnd('handle_http');
    }

    start(opts) {
        opts = Utils.assignInterface(opts,IServerListen);

        this.httpServer = uws.http.createServer( this._httpRequestHandler.bind(this) );
        this.httpServer.listen(opts.port);
    }

}

/*
 * Exports modules
 */ 
module.exports = {
    Server,
    Package
}