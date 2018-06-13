/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');





const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    require('./handlers/LaunchRequestHandler').handler,
    require('./handlers/RegisterNumberIntentHandler').handler,

    require('./handlers/HelpIntentHandler').handler,
    require('./handlers/CancelAndStopIntentHandler').handler,
    require('./handlers/SessionEndedRequestHandler').handler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
