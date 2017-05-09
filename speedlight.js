// NodeJS - Core modules
const events    = require('events');
const cluster   = require('cluster');
const os        = require('os');

// Dependencies modules
const uws       = require('uws');
const async     = require('async');

// Internal modules
const utils     = require('./libs/utils.js');
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
class Server extends events {

    constructor() {
        super();
        this.context    = {};
        this.packages   = {};
    }

    addPackage(pkg) {
        if(pkg instanceof Package === false) {
            throw new TypeError("package argument is not a package");
        }
        this.packages[pkg.name] = pkg;
    }

    start(opts) {
        opts = utils.assignInterface(opts,IServerListen);
        
        if (cluster.isMaster) {
            console.log(`Master ${process.pid} is running`);

            // Fork workers.
            for (let i = 0; i < opts.nbFork; i++) {
                cluster.fork();
            }

            cluster.on('exit', (worker, code, signal) => {
                console.log(`worker ${worker.process.pid} died`);
            });
        } 
        else {
            this.server = uws.http.createServer( (req,res) => {
                console.log(`URL Requested << ${req.url} >>`);
                res.end(Buffer.from('ok'));
            });
            this.server.listen(opts.port);
        }

    }

}

/*
 * Exports modules
 */ 
module.exports = {
    Server
}