const webpack = require('webpack');
const config = require('./webpack.config');
const done = require('./done');
const { getParam } = require('../utils/params');
const { cleanDir } = require('../utils/files');
const { MODULES_PATH } = require('../constants');


(async () => {
    if (getParam('force')) {
        await cleanDir(MODULES_PATH);
    }

    webpack([config], done);
})();
