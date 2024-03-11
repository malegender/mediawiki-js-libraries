const path = require('path');

const { MODULES_PATH, RUNTIME_NAME, VENDORS_NAME, MODULES_DIR } = require('./constants');
const { cleanDir, writeFile } = require('./utils/files');
const logger = require('./utils/logger');

const cleanModuleDir = async () => {
    try {
        await cleanDir(MODULES_PATH);
        [RUNTIME_NAME, VENDORS_NAME].forEach(async (fileName) => {
            await writeFile(path.join(MODULES_PATH, `${fileName}.js`));
        })
        logger(`Directory ${MODULES_DIR} has been cleared`);
    } catch (err) {
        console.error(err);
    }
}

cleanModuleDir();
