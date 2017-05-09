function assignInterface(target,interface) {
    if(target == void 0) {
        target = {};
    }
    const tInterface        = Object.assign({},interface);
    Object.assign(tInterface,target);
    return tInterface;
}


module.exports = {
    assignInterface
}