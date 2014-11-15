'use strict';

var Promise = require('bluebird');

module.exports = {
  name: 'gpio',
  settings: ['pin'],
  run: function(settings) {

    var gpio = require('gpio');

    return new Promise(function (resolve, reject) {
      var pin = Promise.promisifyAll(gpio.export(settings.pin));
      return pin.set(1).then(function(){
        setTimeout(function(){
          pin.set(0);
          resolve();
        }, 1000);
      }).catch(reject);
    });
  }
};
