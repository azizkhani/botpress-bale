const handlePromise = (next, promise) => {
  return promise.then(res => {
    next();
    return res;
  }).catch(err => {
    next(err);
    throw err;
  });
};

const handleText = (event, next, bale) => {
  if (event.platform !== 'bale' || event.type !== 'text') {
    return next();
  }

  const chatId = event.raw.chatId;
  const text = event.text;
  const options = event.raw.options;

  return handlePromise(next, bale.sendText(chatId, text, options));
};

const handleEditMessageText = (event, next, bale) => {
  if (event.platform !== 'bale' || event.type !== 'edited_message_text') {
    return next();
  }

  let options = {
    message_id: event.message_id,
    chat_id: event.chat_id,
    reply_markup: event.reply_markup,
  };

  return handlePromise(next, bale.sendEditMessage(event.text, options));
};



module.exports = {
  'text': handleText,
  'edited_message_text': handleEditMessageText,
  pending: {},
};
