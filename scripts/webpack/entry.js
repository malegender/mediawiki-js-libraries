const path = require('path');
const { EXPOSES_PATH } = require('../constants');
const { getPathsFiles } = require('../utils/files');

const styles = getPathsFiles(EXPOSES_PATH, ['css', 'less'])
  .filter((pathFile) => /(?<=\.style)\.(css|less)/.test(pathFile));

module.exports = [...styles, ...getPathsFiles(EXPOSES_PATH)].reduce((acc, pathFile) => {
  const moduleName = path.relative(EXPOSES_PATH, pathFile).replace(/\.js/, '')

  acc[moduleName] = pathFile;

  return acc;
}, {});

