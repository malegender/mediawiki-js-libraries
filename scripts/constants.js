const path = require('path');
const { getParam } = require('./utils/params');

const ABSOLUTE_PATH = path.resolve(__dirname, '..');
const MODULES_DIR = 'modules';
const RESOURCES_PATH = path.join(ABSOLUTE_PATH, 'resources');
const EXTENSION_NAME = 'JSLibraries';

module.exports.EXTENSION_NAME = EXTENSION_NAME;

module.exports.ABSOLUTE_PATH = ABSOLUTE_PATH;

module.exports.SCRIPTS_PATH = path.join(ABSOLUTE_PATH, 'scripts');

module.exports.MODULES_DIR = MODULES_DIR;

module.exports.MODULES_PATH = path.join(ABSOLUTE_PATH, MODULES_DIR);

module.exports.RESOURCES_PATH = RESOURCES_PATH;

module.exports.EXPOSES_PATH = path.join(RESOURCES_PATH, 'exposes');

module.exports.SRC_PATH = path.join(RESOURCES_PATH, 'src');

const PREFIX_MODULE  = getParam('prefix', 'ext.');
const SUFFIX_MODULE  = getParam('suffix', '');

module.exports.PREFIX_MODULE = PREFIX_MODULE;

module.exports.SUFFIX_MODULE = SUFFIX_MODULE;

module.exports.VENDORS_NAME = 'vendors';

module.exports.RUNTIME_NAME = 'runtime';
