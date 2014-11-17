var sequelize = require('sequelize');
var models = require('./models');
var Promise = require('bluebird');
var pcsclite = require('pcsclite');

var actions = require('./actions');

module.exports = function () {

  var pcsc = pcsclite();

  pcsc.on('reader', function (reader) {

    reader.on('status', function (status) {

      var changes = this.state ^ status.state;
      if (changes) {
        if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
          reader.disconnect(function() {} );
        } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {

          reader.connect(function (share_mode, protocol) {

            // Create a protocol-aware function to transmit APDUs to
            // the reader. We can pass this function to our action
            // modules.
            var reader_transmit = (function(protocol) {
              return function (instruction) {
                return new Promise(function (resolve, reject) {
                  // Convert hex string into byte array
                  var byte_array = instruction.match(/(..?)/g).map(function(pair) {
                    return parseInt(pair, 16);
                  });
                  reader.transmit(new Buffer(byte_array), 40, protocol, function(err, data) {
                    if(err) {
                      reject(err);
                    } else {
                      resolve(data);
                    }
                  });
                });
              };
            })(protocol);

            // APDU for GetCardUid
            return reader_transmit('FFCA000000').then(function (data) {
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

                  actions.run(reader_transmit, entrant, uid);

                });

              }

            });

          });

        }
      }
    });
  });

  pcsc.on('error', function(error) {
    console.error(error);
  });

};
