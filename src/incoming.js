import LRU from 'lru-cache';

const messageEventTypes = [
  'audio',
  'document',
  'photo',
  'sticker',
  'video',
  'voice',
  'contact',
  'location',
];

const actionEventTypes = [
  'new_chat_participant',
  'left_chat_participant',
  'new_chat_title',
  'new_chat_photo',
  'delete_chat_photo',
  'group_chat_created',
  'edited_message',
  'edited_message_caption',
  'channel_post',
  'edited_channel_post',
  'edited_channel_post_text',
  'edited_channel_post_caption,',
  'inline_query',
  'chosen_inline_result',
];

module.exports = (bp, bale) => {
  const messagesCache = LRU({
    max: 10000,
    maxAge: 60 * 60 * 1000,
  });

  const preprocessEvent = (payload) => {
    console.log('preprocessEvent');
    let mid = `${payload.chat.id}_${payload.from.id}_${payload.date}`;

    if (mid && !messagesCache.has(mid)) {
      payload.alreadyProcessed = true;
    } else {
      messagesCache.set(mid, true);
    }

    return payload;
  };

  const extractBasics = (event) => {
    return {
      platform: 'bale',
      raw: event,
    };
  };

  const _handleEvent = (ev, eventType) => {
    var event = {
      type: eventType,
      text:'event',
      chat: ev.chat,
      user: ev.from,
      ...extractBasics(preprocessEvent(ev))
    };
    bp.middlewares.sendIncoming(event);
  };

  bale.bot.setDefaultCallback((message,event) => {
    bp.middlewares.sendIncoming({
      type: 'text',
      chat: event,
      user: event.peer,
      text: message._text,
      message_id: event.peer._id,
      ...extractBasics(event)
    });
  })
};
