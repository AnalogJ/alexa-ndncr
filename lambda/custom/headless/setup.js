const fs = require('fs');
const tar = require('tar');
const puppeteer = require('puppeteer');
const config = require('./config');

exports.getBrowser = (() => {
  let browser;
  return async () => {
    if (typeof browser === 'undefined' || !await isBrowserAvailable(browser)) {
      await setupChrome();
      browser = await puppeteer.launch({
        headless: true,
        executablePath: config.executablePath,
        args: config.launchOptionForLambda,
        dumpio: !!exports.DEBUG,
      });
      console.log(`launch done: ${await browser.version()}`);
    }
    return browser;
  };
})();

const isBrowserAvailable = async (browser) => {
  try {
    await browser.version();
  } catch (e) {
    console.log(e); // not opened etc.
    return false;
  }
  return true;
};

const setupChrome = async () => {
  if (!await existsExecutableChrome()) {
    if (await existsLocalChrome()) {
      console.log('setup local chrome');
      await setupLocalChrome();
    } else {
      console.log("COULD NOT SETUP LOCAL CHROME")
      throw new Error("COULD NOT SETUP LOCAL CHROME")
    }
    console.log('setup done');
  }
};

const existsLocalChrome = () => {
  return new Promise((resolve, reject) => {
    fs.exists(config.localChromePath, (exists) => {
      resolve(exists);
    });
  });
};

const existsExecutableChrome = () => {
  return new Promise((resolve, reject) => {
    fs.exists(config.executablePath, (exists) => {
      resolve(exists);
    });
  });
};

const setupLocalChrome = () => {
  console.log("Starting extraction")
  return new Promise((resolve, reject) => {
    fs.createReadStream(config.localChromePath)
      .on('error', (err) => {
        console.log("Error reading tar stream")
        reject(err)
      })
      .pipe(tar.x({
        C: config.setupChromePath,
      }))
      .on('error', (err) => {
        console.log("Error extracting tar file")
        reject(err)
      })
      .on('end', () => {
        console.log("Successfully extracted tar.")
        resolve()
      });
  });
};

const debugLog = (log) => {
  if (config.DEBUG) {
    let message = log;
    if (typeof log === 'function') message = log();
    Promise.resolve(message).then(
      (message) => console.log(message)
    );
  }
};