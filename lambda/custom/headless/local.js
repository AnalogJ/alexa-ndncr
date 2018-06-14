const index = require('../index');
const config = require('./config');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: process.env.SLOWMO_MS,
    dumpio: !!config.DEBUG,
    // use chrome installed by puppeteer
  });
  await loadPage(browser)
    .then((result) => console.log(result))
    .catch((err) => console.error(err));
  await browser.close();
})();



async function loadPage(browser) {
  // implement here
  // this is sample
  const page = await browser.newPage();
  await page.goto('https://www.google.co.jp',
    {waitUntil: ['domcontentloaded', 'networkidle0']}
  );
  console.log((await page.content()).slice(0, 500));

  await page.type('#lst-ib', 'aaaaa');
  // avoid to timeout waitForNavigation() after click()
  await Promise.all([
    // avoid to
    // 'Cannot find context with specified id undefined' for localStorage
    page.waitForNavigation(),
    page.click('[name=btnK]'),
  ]);

  /* screenshot
    await page.screenshot({path: '/tmp/screenshot.png'});
    const aws = require('aws-sdk');
    const s3 = new aws.S3({apiVersion: '2006-03-01'});
    const fs = require('fs');
    const screenshot = await new Promise((resolve, reject) => {
      fs.readFile('/tmp/screenshot.png', (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
    await s3.putObject({
      Bucket: '<bucket name>',
      Key: 'screenshot.png',
      Body: screenshot,
    }).promise();
  */

  // cookie and localStorage
  await page.setCookie({name: 'name', value: 'cookieValue'});
  console.log(await page.cookies());
  console.log(await page.evaluate(() => {
    localStorage.setItem('name', 'localStorageValue');
    return localStorage.getItem('name');
  }));
  await page.close();
  return 'done';
};
