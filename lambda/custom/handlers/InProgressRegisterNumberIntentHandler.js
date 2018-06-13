const InProgressRegisterNumberIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegisterNumberIntent'
      && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;

    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};

exports.handler = InProgressRegisterNumberIntentHandler