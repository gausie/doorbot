'use strict';

var Promise = require('bluebird');

module.exports = {
  name: 'beep',
  settings: [],
  run: function(settings, entrant, models, reader_transmit) {

    if (entrant) {
      // Happy beep
      return reader_transmit([0xFF, 0x00, 0x40, 0xAC, 0x04, 0x09, 0x09, 0x01, 0x01]);
    } else {
      // Sad beep
      return reader_transmit([0xFF, 0x00, 0x40, 0x5C, 0x04, 0x01, 0x01, 0x04, 0x01]);
    }

  }
};
