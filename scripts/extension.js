const path = require('path');

const {
    EXTENSION_NAME,
    MODULES_PATH,
    ABSOLUTE_PATH,
    PREFIX_MODULE,
    SUFFIX_MODULE,
    RUNTIME_NAME,
    VENDORS_NAME
} = require('./constants');
const { getPathsFiles, writeFile } = require('./utils/files');
const { getParam } = require('./utils/params');
const logger = require('./utils/logger');

const config = require('../extension.json');

const FILE_NAME      = getParam('file', 'extension.json');
const ROOT_DIR_KEY   = '$root';
const VENDORS_MODULE = `${PREFIX_MODULE}${EXTENSION_NAME}.${VENDORS_NAME}${SUFFIX_MODULE}`;
const RUNTIME_MODULE = `${PREFIX_MODULE}${EXTENSION_NAME}.${RUNTIME_NAME}${SUFFIX_MODULE}`;

const parsePath = (filePath) => {
    const { name, dir, ext } = path.parse(filePath);
    const mainName = name.replace(/.style$/, '');
    const dirPath = path.relative(MODULES_PATH, dir).split('/').join('.');
    const key = !dirPath ? `${PREFIX_MODULE}${EXTENSION_NAME}.${mainName}${SUFFIX_MODULE}`
        : `${PREFIX_MODULE}${EXTENSION_NAME}.${dirPath}.${mainName}${SUFFIX_MODULE}`;

    return {
        key,
        name,
        path:  path.relative(MODULES_PATH, filePath),
        dir: dirPath || ROOT_DIR_KEY,
        ext
    }
}

const modules = {};

getPathsFiles(MODULES_PATH, ['js', 'css', 'less']).forEach((filePath) => {
    const module= parsePath(filePath);

    modules[module.dir] = modules[module.dir] || {};
    modules[module.dir][module.key] = modules[module.dir][module.key] || [];
    modules[module.dir][module.key].push(module);

});

const createResourceModule = (moduleName, modules) => {
    const resourceModule = config.ResourceModules[moduleName] || {};
    const dependencies = resourceModule.dependencies ? [...resourceModule.dependencies] : [];
    resourceModule.packageFiles = [];
    resourceModule.styles = [];

    modules.forEach((module) => {
        switch (module.ext) {
            case '.css':
                resourceModule.styles.push(module.path);
                break;
            case '.js':
                resourceModule.packageFiles.push(module.path);
                break
        }
    });

    if (resourceModule.packageFiles.length > 0) {
        if (moduleName !== RUNTIME_MODULE && moduleName !== VENDORS_MODULE) {
            dependencies.push(RUNTIME_MODULE);
        }
    }

    if (dependencies.length > 0) {
        resourceModule.dependencies = [...new Set(dependencies)];
    }

    return resourceModule;
}

const resourceModules = {};

Object.values(modules).forEach((data) => {
    for (let moduleName in data) {
        resourceModules[moduleName] = createResourceModule(moduleName, data[moduleName]);
    }
}, {});

config.ResourceModules = resourceModules;

if (getParam('dry-run')) {
    logger(config, 'Done!');
} else {
    (async () => {
        try {
            await writeFile(path.join(ABSOLUTE_PATH, FILE_NAME), JSON.stringify(config, null, 4));
            logger('Done!');
        } catch (error) {
            console.log(error);
        }
    })();
}
