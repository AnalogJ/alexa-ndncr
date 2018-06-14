const setup = require('../headless/setup');

const CompletedRegisterNumberIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegisterNumberIntent'
  },
  async handle(handlerInput) {

    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;

    let speechOutput = `We'll add <say-as interpret-as="telephone">${handlerInput.requestEnvelope.request.intent.slots.PhoneNumber.value}</say-as> to the national do not call list`;

    console.log("!!! PRINTING HANDLER INPUT")
    console.log(handlerInput)

    handlerInput.context.callbackWaitsForEmptyEventLoop = false

    const browser = await setup.getBrowser();

    return loadPage(browser)
      .then(function(result){

        console.log("!!!!!!!!!!!!!!!RESULT")
        console.log(result)


        return handlerInput.responseBuilder
          .speak(speechOutput + result)
          .withSimpleCard('Do Not Call - Register', speechOutput)
          .getResponse();
      })
      .catch(function(err){
        console.log("!!!!!!!!!!!!!!!ERROR")
        console.log(err)
        return handlerInput.responseBuilder
          .speak("An error occurred " + err)
          .withSimpleCard('Do Not Call - Register', speechOutput)
          .getResponse();
      })


  },
};



// 2. Helper Functions ============================================================================



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




function slotValue(slot, useId){
  let value = slot.value;
  let resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null;
  if(resolution && resolution.status.code == 'ER_SUCCESS_MATCH'){
    let resolutionValue = resolution.values[0].value;
    value = resolutionValue.id && useId ? resolutionValue.id : resolutionValue.name;
  }
  return value;
}

function getSlotValues(filledSlots) {
  const slotValues = {};

  console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);
  Object.keys(filledSlots).forEach((item) => {
    const name = filledSlots[item].name;

    if (filledSlots[item] &&
      filledSlots[item].resolutions &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case 'ER_SUCCESS_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            isValidated: true,
          };
          break;
        case 'ER_SUCCESS_NO_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].value,
            isValidated: false,
          };
          break;
        default:
          break;
      }
    } else {
      slotValues[name] = {
        synonym: filledSlots[item].value,
        resolved: filledSlots[item].value,
        isValidated: false,
      };
    }
  }, this);

  return slotValues;
}



exports.handler = CompletedRegisterNumberIntentHandler