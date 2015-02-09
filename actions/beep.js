'use strict';

var Promise = require('bluebird');

module.exports = {
  name: 'beep',
  settings: [],
  priority: 99,
  run: function(settings, entrant, models, reader_transmit) {

    if (entrant) {
      // Happy beep
      return reader_transmit('FF0040AC0409090101');
    } else {
      // Sad beep
      return reader_transmit('FF00405C0401010401');
    }

  }
};
