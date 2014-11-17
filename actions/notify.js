'use strict';

var Promise = require('bluebird');
var nodemailer = require('nodemailer');

module.exports = {
  name: 'notify',
  settings: ['user','pass'],
  run: function(settings, entrant, models) {

    if (!entrant) return;

    if (!settings.user || !settings.pass) return;

    var transport = Promise.promisifyAll(nodemailer.createTransport("SMTP", {
      auth: {
        user: settings.user,
        pass: settings.pass
      }
    }));

    if(!entrant.resident){
      models.User.findAll({
        where: { notify: true },
        attributes: ['email']
      }).then( function(recipients) {
        return transport.sendMailAsync({
          from: "Doorbot <doorbot@***REMOVED***>",
          to: recipients.join(", "),
          subject: entrant.name + " has opened the door <EOM>",
          text: ""
        });
      });
    }

  }
};
