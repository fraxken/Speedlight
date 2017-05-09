const speedlight = require('./speedlight');

const server = new speedlight.Server();

server.start({ 
    port: 3000,
    nbFork: 1
});