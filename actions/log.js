'use strict';

var Promise = require('bluebird');

module.exports = {
  name: 'beep',
  settings: [],
  run: function(settings, entrant, models, reader_transmit, carduid) {

    models.Log.create({
      CardUid: carduid,
      status: (entrant) ? 'approved' : 'denied'
    });

  }
};
