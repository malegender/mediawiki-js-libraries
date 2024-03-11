const getValueFromArgument = (arg) => {
    if (arg === 'true') {
        return true;
    }

    if (arg === 'false') {
        return false;
    }

    if (!isNaN(arg)) {
        return Number(arg);
    }

    return arg;
}

const initParams = () => {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        return {};
    }

    const params = {};
    let currentParam = '';

    args.forEach((arg) => {
        if (/^-/.test(arg)) {
            currentParam = arg;
            params[currentParam] = [];
            return;
        }

        if (params[currentParam] === undefined || !Array.isArray(params[currentParam])) {
            return;
        }

        const param = getValueFromArgument(arg);

        params[currentParam].push(param);

    });

    return Object.keys(params).reduce((acc, key) => {
        const value = params[key];

        switch (value.length) {
            case 0:
                acc[key] = true;
                break;
            case 1:
                acc[key] = value[0];
                break;
            default:
                acc[key] = value;
        }

        return acc;
    }, {});
}

function getParams() {
    if (getParams.params === undefined) {
        getParams.params = initParams();
    }

    return getParams.params;
}

module.exports.getParams = getParams;

module.exports.getParam = (name, defaultValue) => {
    const params = getParams();

    let paramName = (() => {
        if (/^-/.test(name)) {
            return name;
        }

        return name.length > 1 ? `--${name}` : `-${name}`;
    })();

    const value = params[paramName];

    if (value === undefined) {
        return defaultValue;
    }

    return value;
}
