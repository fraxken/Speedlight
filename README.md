# Speedlight
NodeJS ES7 framework on top of µWS 

# Mentaliy focus

- Low-level framework (less interfaces as possible).
- Less dependencies as possible.
- Modular framework (Like KoaJS).
- Explicit API and methods.
- Explicit and clean Middleware/Bundle mechanism.

## Example 

```js
const speedlight = require('./speedlight');

const server = new speedlight.Server();

class pkgTest extends speedlight.Package {
    constructor() {
        super("pkgTest");
        this.setVar("bimboum","pro!");
        this.use(async function(ctx) {
            console.log('match aPkg!');
            console.log(ctx.bimboum);
            console.log(ctx.test);
        });
    }
}

server.setVar("test","lol");
server.use(new pkgTest());
server.use(async function(ctx) {
    console.log('match global use!');
});

server.start({ 
    port: 3000,
    nbFork: 1
});
```