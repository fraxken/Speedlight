const events = require('events');

/*
 * Server class
 */ 
const IServerListen = {
    port: 3000,
    ip: "0.0.0.0"
}

const IServerFork = {
    nbFork: 1,
    port: 3000,
    ip: "0.0.0.0"
}

class Server extends events {

    constructor() {
        super();
        this.fibers = new Map(); 
        this.fibers.set('global',new Fiber({ name: 'global' }));
    }

    use(fiber) {
        if(fiber instanceof Fiber) {
            const parent = fiber.parent;
            if(parent !== undefined) {
                console.log(parent);
            }
            this.fibers.set(fiber.name,fiber);
        }
    }

    loadNetwork(path) {

    }

    listen(opts) {
        Object.assign(opts,IServerListen);
    }

    fork(opts) {
        Object.assign(opts,IServerFork);
    }

}

/*
 * Fiber class
 */ 
const IFiberConstructor = {
    name: null,
    inherit: true,
    parent: null
}

class Fiber extends events {

    constructor(opts) {
        super();
        Object.assign(this,IFiberConstructor,opts);
        this.childrens = {
            fibers: new Map(),
            packages: new Map()
        };
        this.connect(new Scope({ name: "data" }));
    }

    connect(entity) {
        if(entity instanceof Package) {
            if( this.childrens.packages.has(entity.name) === true) {
                throw "Package already connected with this fiber";
            }
            this[entity.name] = entity;
            this.childrens.packages.set(entity.name,entity);
        }
        else if(entity instanceof Fiber) {
            if( this.childrens.fibers.has(entity.name) === true) {
                throw "Fiber already connected with this fiber";
            }
            this.childrens.fibers.set(entity.name,entity);
        }
        else {
            throw "Invalid entity. Only Package and Fiber are allowed!";
        }
    }

    unconnect(entity) {

    }

}

/*
 * Package class
 */ 
const IPackageConstructor = {
    name: null
}

class Package extends events {

    constructor(opts) {
        super();
        Object.assign(this,IPackageConstructor,opts);
        if(this.name === undefined) {
            throw "Invalid package name";
        }
    }

    connect(fiber) {
        if(fiber instanceof Fiber) {
            fiber.connect(this);
            return true;
        }
        return false;
    }

}

/*
 * Scope package
 */ 
class Scope extends Package {

    constructor(opts) {
        super(opts);
        this.a = "hello world";
    }

}

/*
 * Exports all
 */ 
module.exports = {
    Server,
    Fiber,
    Package
}
