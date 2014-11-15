var sequelize = require('sequelize');
var models = require('./models');
var Promise = require('bluebird');
var gpio = require('gpio');
var jayson = require('jayson');
var nodemailer = require('nodemailer');
var pcsc = require('pcsclite');

module.exports = function () {

  models.Setting.findAll({
    where: {
      key: ['jsonrpc', 'email.user', 'email.pass']
    }
  }).then(function(settings) {

    // Extract config into an object
    var config = settings.reduce(function(p, c) {
      p[c.key] = c.value;
      return p;
    }, {});

    // Preparing classes
    var pcsc = pcsc();
    var pin = Promise.promisifyAll(gpio.export(4));
    var json = jayson.client.http(config.jsonrpc);

    pcsc.on('reader', function (reader) {

      Promise.promisifyAll(reader);

      reader.on('status', function (status) {
        var changes = this.state ^ status.state;
        if (changes) {
            if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
              reader.disconnect();
            } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {

                reader.connect()
                .then(function (protocol) {
                  return reader.transmit(new Buffer([0xFF, 0xCA, 0x00, 0x00, 0x00]), 40, protocol);
                }).then(function (data) {

                  var status = data.slice(-2);
                  if(status.toString('hex',0,1) != 90){
                    throw new Error("Reader returned error:" + status);
                  }else{
                    var uid = data.slice(0,-2).toString('hex').toLowerCase();

                    models.Card.findOne({
                      where: {
                        uid: uid
                      },
                      attributes: ['name', 'resident'],
                      include: [{
                        model: models.User,
                        attributes: [],
                        where: {
                          enabled: true
                        }
                      }]
                    }).then(function(entrant) {

                      var status;

                      // Did we find someone?
                      if(entrant) {

                        // Yep!
                        status = "approved";

                        // Make the reader do a happy beep
                        reader.transmit(new Buffer([0xFF, 0x00, 0x40, 0xAC, 0x04, 0x09, 0x09, 0x01, 0x01]), 40, protocol, function(){ /* do something in case of failure */ });

                        // Send emails
                        if(!entrant.resident){
                          models.User.findAll({
                            where: { notify: true },
                            attributes: ['email']
                          }).then( function(recipients) {
                            return transport.sendMail({
                              from: "Doorbot <doorbot@***REMOVED***>",
                              to: recipients.join(", "),
                              subject: entrant.name + " has opened the door <EOM>",
                              text: ""
                            });
                          });
                        }

                        // Show JSON-RPC notification
                        client.request('GUI.ShowNotification', {
                          title: "Doorbot",
                          message: (entrant.resident) ? entrant.name + " is home!" : entrant.name + " is here!"
                        });

                        // Open the door
                        pin.set(1).then(function(){
                          setTimeout(function(){ pin.set(0) }, 1000);
                        });

                      } else {

                        // Nope
                        status = "denied";

                        // Make the reader do a sad beep
                        reader.transmit(new Buffer([0xFF, 0x00, 0x40, 0x5C, 0x04, 0x01, 0x01, 0x04, 0x01]), 40, protocol, function(){ /* do something in case of failure */ });

                      }

                      // Log the activity
                      models.Log.create({
                        CardUid: uid,
                        status: status
                      });

                    });

                  }
                }).catch(function(error) {
                  console.erorr(error);
                });
            }
        }
      });

    });

    pcsc.on('error', function(error) {
      console.error(error);
    });

  });

};
