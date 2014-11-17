'use strict';

var Promise = require('bluebird');

module.exports = {
  name: 'gpio',
  settings: ['pin'],
  run: function(settings, entrant) {

    if (!entrant) return;

    var pin = parseInt(settings.pin);
    var gpio = Promise.promisifyAll(require('pi-gpio'));

    return gpio.openAsync(pin, "output").then(function() {
      return gpio.writeAsync(pin, 1);
    }).then(function() {
      return new Promise(function(r) {
        setTimeout(function(){
          r();
        }, 1000);
      });
    }).then(function() {
      return gpio.writeAsync(pin, 0);
    }).then(function() {
      return gpio.closeAsync(pin);
    });

  }
};
