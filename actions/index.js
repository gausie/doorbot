var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var models = require('../models');

module.exports = {

  getList: function() {

    return fs.readdir(__dirname).then(function(files) {
      return files.filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
      }).map(function(file) {
        return require(file);
      });
    });

  },

  run: function(entrant) {

    this.getList().then(function(actions) {

      return Promise.all(actions.map(function(action) {
        // Get settings for this action
        return models.Setting.findAll({
          where: ["key LIKE ?", action.name+'%']
        }).then(function(settings) {

          // Transform array of settings objects into a single object,
          // stripping the namespace from the keys as we go.
          settings = settings.reduce(function(p, c) {
            p[c.key.substring(action.name.length+1)] = c.value;
            return p;
          }, {});

          // 'this' will be the details of the entrant (if any)
          return action.run(settings, entrant, models);
        });
      }));

    });

  }

};
