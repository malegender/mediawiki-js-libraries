const fs = require('fs');
const logger = require('../utils/logger');
const { getPathsFiles } = require('../utils/files');
const { MODULES_PATH } = require('../constants');

module.exports = (err, stats) => {
  process.stdout.write(stats.toString() + "\n");

  getPathsFiles(MODULES_PATH, ['js', 'css']).forEach((pathFile) => {
    const cssRegexp = /\.(css|less)\.css/;

    if (cssRegexp.test(pathFile)) {
      const newPath = pathFile.replace(cssRegexp, '.css');

      fs.rename(pathFile, newPath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        logger(`${pathFile} was renamed`);
      });
    }

    if (/\.(css|less)\.js/.test(pathFile)) {
      fs.unlink(pathFile, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        logger(`${pathFile} was deleted`);
      });
    }
  });
}
