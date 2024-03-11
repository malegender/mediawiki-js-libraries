const fs = require('fs');
const path = require('path');
const {
  MODULES_PATH,
  RUNTIME_NAME,
  VENDORS_NAME,
  MODULES_DIR
} = require('../constants');
const logger = require('./logger');

const getPathsFiles = (dir, ext = 'js', allFiles = []) => {
  const files = fs.readdirSync(dir);
  const exts = Array.isArray(ext) ? ext : [ext];

  for (let i in files) {
    const filePath = dir + '/' + files[i];

    if (fs.statSync(filePath).isDirectory()) {
      getPathsFiles(filePath, exts, allFiles);
      continue;
    }

    let fileExt = path.extname(filePath).replace('.', '');

    if (exts.includes(fileExt)) {
      allFiles.push(filePath);
    }
  }
  return allFiles;
};

const makeDir = (pithDir) => new Promise((resolve, reject) => {
  fs.mkdir(pithDir, err => {
    if(err) {
      reject(err);
      return;
    }
    resolve();
  });
});


const checkDir = (pithDir) => new Promise((resolve, reject) => {
  fs.stat(pithDir, (err) => {
    if (!err) {
      resolve(true);
      return;
    }

    if (err?.code === 'ENOENT') {
      resolve(false);
      return;
    }

    reject(err);
  });
});

const rmDir = (pithDir) => new Promise(async (resolve, reject) => {
  fs.rm(pithDir, { recursive: true }, async (err) => {
    if (!err || err.code === 'ENOENT') {
      resolve();
      return;
    }

    reject(err);
  });
});

const cleanDir = async (pithDir) => {
  await rmDir(pithDir);
  await makeDir(pithDir);
}

const writeFile = (pathFile, content = '') => new Promise((resolve, reject) => {
  fs.writeFile(pathFile, content, error => {
    if (error) {
      reject(error);
      return;
    }
    resolve()
  });
});

module.exports.getPathsFiles      = getPathsFiles;
module.exports.makeDir            = makeDir;
module.exports.checkDir           = checkDir;
module.exports.rmDir              = rmDir;
module.exports.cleanDir           = cleanDir;
module.exports.writeFile          = writeFile;
