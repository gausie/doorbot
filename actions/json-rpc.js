'use strict';

var Promise = require('bluebird');

module.exports = {
  name: 'json-rpc',
  settings: ['server'],
  run: function(settings, entrant) {

    if (!entrant) return;

    if (!settings.server) return;

    var jayson = require('jayson');

    var client = Promise.promisifyAll(jayson.client.http(settings.server));

    return client.requestAsync('GUI.ShowNotification', {
      title: "Doorbot",
      message: (entrant.resident) ? entrant.name + " is home!" : entrant.name + " is here!"
    });

  }
};
