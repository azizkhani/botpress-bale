import outgoing from './outgoing';
import actions from './actions';
import umm from './umm';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const Promise = require('bluebird');

import Bale from './bale';

let bale = null;
const outgoingPending = outgoing.pending;

const outgoingMiddleware = (event, next) => {
  if (event.platform !== 'bale') {
    return next();
  }
  
  if (!outgoing[event.type]) {
    return next('Unsupported event type: ' + event.type);
  }

  const setValue = method => (...args) => {
    if (event.__id && outgoingPending[event.__id]) {

      if (args && args[0] && args[0].message_id) {
        let ts = args[0].message_id.split(':')[0];
        ts = ts && ts.substr(4);
        outgoingPending[event.__id].timestamp = parseInt(ts);
        outgoingPending[event.__id].mid = args[0].message_id;
      }

      if (method === 'resolve' &&
          (event.raw.waitDelivery || event.raw.waitRead)) {
        // We skip setting this value because we wait
      } else {
        outgoingPending[event.__id][method].apply(null, args);
        delete outgoingPending[event.__id];
      }
    }
  };

  outgoing[event.type](event, next, bale).
      then(setValue('resolve'), setValue('reject'));
};

module.exports = {

  config: {
    botToken: {type: 'string', required: true, default: '', env: 'BALE_TOKEN'},
  },

  init: function(bp, config) {
    bp.middlewares.register({
      name: 'bale.sendMessages',
      type: 'outgoing',
      order: 100,
      handler: outgoingMiddleware,
      module: 'botpress-bale',
      description: 'Sends out messages that targets platform = bale.' +
      ' This middleware should be placed at the end as it swallows events once sent.',
    });
    

    bp.bale = {};
    _.forIn(actions, (action, name) => {
      bp.bale[name] = actions[name];
      let sendName = name.replace(/^create/, 'send');
      bp.bale[sendName] = Promise.method(function() {

        var msg = action.apply(this, arguments);
        msg.__id = new Date().toISOString() + Math.random();
        const resolver = {event: msg};

        const promise = new Promise(function(resolve, reject) {
          resolver.resolve = resolve;
          resolver.reject = reject;
        });

        outgoingPending[msg.__id] = resolver;

        bp.middlewares.sendOutgoing(msg);

        return promise;
      });
    });

    umm(bp); // Initialize UMM
  },

  ready: async function(bp, configurator) {

    const config = await configurator.loadAll();

    bale = new Bale(bp, config);

    bale.startPolling(bp);
  },
}
