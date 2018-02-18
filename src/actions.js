
const validateChatId = (chatId) => {
  if (typeof (chatId) !== 'number') {
    throw new Error('Invalid chat id: ' + chatId);
  }
};

const validateText = (text) => {
  if (typeof(text) !== 'string' && text !== '') {
    throw new Error('Text must be a string.');
  }
};

const validateUrl = (url) => {
  if (typeof(url) !== 'string') {
    throw new Error('Expected URL to be a string')
  }
}


const createText = (chatId, text, options = {}) => {
  //validateChatId(chatId);
  validateText(text);

  return  {
    platform: 'bale',
    type: 'text',
    text: text,
    raw: {
      chatId: chatId,
      options: options,
    },
  };
};


module.exports = {
  createText
};
