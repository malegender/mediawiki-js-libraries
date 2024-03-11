const logger = (param) => {
    if (param instanceof Object) {
        console.log(JSON.stringify(param, null, 2));
        return;
    }

    console.log(param);
}

module.exports = (...params) => params.forEach(logger);
