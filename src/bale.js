const SDK = require('balebot');
const Promise = require('bluebird');

import incoming from './incoming';

class Bale {
  constructor(bp, config) {
    if (!bp || !config) {
      throw new Error('You need to specify botpress and config');
    }
    this.bot = null;
    this.connected = false;
    this.bot = new SDK.BaleBot(config.botToken);
    bp.logger.info('bale bot created');
  }

  setConfig(config) {
    this.config = Object.assign({}, this.config, config);
  }

  validateConnection() {
    if (!this.connected) {
      throw new Error('You are not connected...');
    }
  }

  static validateText(text) {
    const type = typeof(text);
    if (type !== 'string') {
      throw new Error(
          'Text format is not valid (actual: ' + type + ', required: string)');
    }
  }

  static validateChatId(chatId) {
    const type = typeof(chatId);
    if (type !== 'number') {
      throw new Error('Chat id format is not valid (actual: ' + type +
          ', required: number)');
    }
  }


  static validateOptions(options) {
    const type = typeof(options);
    if (type !== 'object') {
      throw new Error('Options format is not valid (actual: ' + type +
          ', required: object)');
    }
  }

  static validateBeforeReaction(options) {
    if (!(options.file || options.file_comment || options.chat ||
        options.timestamp)) {
      throw new Error(
          'You need to set at least a destination options (file, file_comment, chat, timestamp)...');
    }
  }

  validateBeforeSending(chatId, options) {
    this.validateConnection();
    //Bale.validateChatId(chatId);
    Bale.validateOptions(options);
  }

  sendText(chatId, text, options) {
    this.validateBeforeSending(chatId, options);
    Bale.validateText(text);
    let msg = new SDK.TextMessage(text);
    let receiver = new SDK.User(chatId._id /*user id*/, chatId._accessHash /*user access hash*/);
    
    return Promise.fromCallback(() => {
      this.bot.send(msg, receiver);
    });
  }

  startPolling(bp) {
    incoming(bp, this);
    bp.logger.info('bale loaded handler');
    this.bot.setOnMessage();
    bp.logger.info('bale started polling');
    this.connected = true;
  }
}

module.exports = Bale;
