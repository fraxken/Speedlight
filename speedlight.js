// NodeJS - Core modules
const events    = require('events');
const cluster   = require('cluster');
const os        = require('os');

// Dependencies modules
const uws       = require('uws');
const async     = require('async');

// Internal modules
const Utils     = require('./libs/utils.js');
const Package   = require('./libs/package.js');
const Router    = require('./libs/router.js');

// Global variables
const nbCPUS    = os.cpus().length;

/*
 * Server interfaces
 */ 
const IServerListen = {
    port: 3000,
    ip: "0.0.0.0",
    nbFork: nbCPUS
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

        if (cluster.isMaster) {
            console.log(`Master ${process.pid} is running`);

            // Fork workers.
            for (let i = 0; i < opts.nbFork; i++) {
                cluster.fork();
            }

            cluster.on('exit', (worker, code, signal) => {
                console.log(`worker ${worker.process.pid} died`);
            });
        } else {
            this.httpServer = uws.http.createServer( this._httpRequestHandler.bind(this) );
            this.httpServer.listen(opts.port);
        }
    }

}

/*
 * Exports modules
 */ 
module.exports = {
    Server,
    Package
}