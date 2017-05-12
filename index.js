const speedlight = require('./speedlight');

const server = new speedlight.Server();

class pkgTest extends speedlight.Package {
    constructor() {
        super("pkgTest");
    }
}

const aPkg = new pkgTest();
aPkg.setVar("bimboum","pro!");
aPkg.use(async function(ctx) {
    console.log('match aPkg!');
    console.log(ctx.bimboum);
    console.log(ctx.test);
});

server.setVar("test","lol");
server.use(aPkg);
server.use(async function(ctx) {
    console.log('match global use!');
});

server.start({ 
    port: 3000,
    nbFork: 1
});