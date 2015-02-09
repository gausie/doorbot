var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var models = require('../models');

module.exports = {

  start: function() {

    var self = this;

    //Load settings
    this.loadSettings().then(function(settings) {
      self._settings = settings;
    });

    // Load actions
    this.loadActions().then(function(actions) {
      self._actions = actions;
    });

  },

  _actions: [],
  loadActions: function() {

    return fs.readdirAsync(__dirname).then(function(files) {
      return files.filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
      }).map(function(file) {
        return require('./'+file);
      }).sort(function(a, b) {
        return (b.priority || 0) - (a.priority || 0);
      });
    });

  },

  _settings: {},
  loadSettings: function() {
     // Get settings for this action
    return models.Setting.findAll().then(function(settings) {

      // Transform our settings array
      return settings.reduce(function(p, c) {
        key = c.key.split('.');
        p[key[0]] = p[key[0]] || {};
        p[key[0]][key[1]] = c.value;
        return p;
      }, {});

    });
  },

  run: function(reader, entrant, uid) {

    var self = this;

    return Promise.all(this._actions.map(function(action) {

      var settings = self._settings[action.name];

      return action.run(settings, entrant, models, reader, uid);

    }));

  }

};
