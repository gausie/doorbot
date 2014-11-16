'use strict';

var Promise = require('bluebird');

module.exports = {
  name: 'gpio',
  settings: ['pin'],
  run: function(settings, entrant) {

    if (!entrant) return;

    var pin = settings.pin;
    var gpio = Promise.promisifyAll(require('pi-gpio'));

    return gpio.open(pin, "output").then(function() {
      return gpio.write(pin, 1);
    }).then(function() {
      return new Promise(function(r) {
        setTimeout(function(){
          r();
        }, 1000);
      });
    }).then(function() {
      return gpio.write(pin, 0);
    }).then(function() {
      return gpio.close(16);
    });

  }
};
