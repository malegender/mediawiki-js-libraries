const path = require('path');

const { ABSOLUTE_PATH } = require('./constants');
const defaultConfig = require('./default.config.js');
const config = require(path.join(ABSOLUTE_PATH, 'jsl.config.js'));

module.exports = { ...defaultConfig, config };
