const CompletedRegisterNumberIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegisterNumberIntent'
  },
  handle(handlerInput) {

    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;

    let speechOutput = `We'll add <say-as interpret-as="telephone">${handlerInput.requestEnvelope.request.intent.slots.PhoneNumber.value}</say-as> to the national do not call list`;


    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard('Do Not Call - Register', speechOutput)
      .getResponse();
  },
};



// 2. Helper Functions ============================================================================


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