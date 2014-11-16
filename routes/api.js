/*
 * Serve JSON to our AngularJS client
 */
var sequelize = require('sequelize');
var models = require('../models');
var actions = require('../actions');
var express = require('express');
var router = express.Router();
var _ = require('lodash');

router.get('/settings', function(req, res, next) {
  actions.getList().then(function(actionlist) {
    models.Setting.findAll().then(function(settings) {

      // Transform our settings array
      settings = settings.reduce(function(p, c) {
        key = c.key.split('.');
        p[key[0]] = p[key[0]] || {}
        p[key[0]][key[1]] = c.value;
        return p;
      }, {});

      // Add any unfilled settings
      actionlist.forEach(function(action) {
        action.settings.forEach(function(key) {
          if (settings[action.name] === undefined || settings[action.name][key] === undefined) {
            settings[action.name] = settings[action.name] || {}
            settings[action.name][key] = '';
          }
        });
      });

      // Return it
      res.jsonp(settings);

    });
  });
});

router.get('/users', function(req, res, next) {

  if (req.query.summary !== undefined ) {

    models.User.findAll({
      where: where,
      attributes: ['id', 'name', 'email', 'resident', 'notify', 'enabled', [sequelize.fn('COUNT', sequelize.col('Cards.uid')), 'CardCount']],
      group: [sequelize.col('User.id')],
      include: [{
        model: models.Card,
        attributes: []
      }]
    }).then(function(users) {
      res.json(users);
    }).catch(function(err) {
      next(err);
    });

  } else {

    var where;
    if (req.query.name) {
      where = ["name LIKE ?", '%'+req.query.name+'%'];
    }

    models.User.findAll({
      where: where,
      include: [ models.Card ]
    }).then(function(users) {
      res.json(users);
    }).catch(function(err) {
      next(err);
    });

  }

});

router.get('/users/:user', function(req, res) {
  models.User.find({
    where: { id: req.params.user },
    include: [ models.Card ]
  }).then(function(users) {
    res.json(users);
  }).catch(function(err) {
    next(err);
  });
});

router.post('/users/', function(req, res, next) {
  models.User.create(req.body, {
    include: [ models.Card ]
  }).then(function(user) {
    res.json(user);
  }).catch(function(err) {
    next(err);
  });
});

router.delete('/users/:user', function(req, res, next) {
  var UserId = req.params.user;
  models.User.find(UserId).success(function(user) {
    user.destroy().success(function() {
      models.Card.destroy({
        where: {
          UserId: UserId
        }
      }).success(function() {
        res.send('deleted');
      })
    })
  });
});

router.put('/users/:user', function(req, res, next) {
  models.User.find({
    where: { id: req.params.user },
    include: [ models.Card ]
  }).then(function (user) {
    return user.updateAttributes(req.body);
  }).then(function (results) {
    res.json(results);
  }).catch(function (err) {
    next(err);
  });
});

router.get('/logs', function(req, res) {
  var page = req.query.page || 1;
  var limit = req.query.limit || 10;
  var offset = (page-1) * limit;
  models.Log.findAndCountAll({
    offset: offset,
    limit: limit,
    order: 'Log.createdAt DESC',
    include: [ {
      model: models.Card,
      include: [ models.User ]
    } ]
  }).success(function(results) {
    res.json({
      page: page,
      offset: offset,
      limit: limit,
      total: results.count,
      rows: results.rows
    });
  });
});

router.get('/graph', function(req, res) {

  var interval = "day";
  var limit = 7;
  var offset = 0;

  var end = now - (offset * interval);
  var start = end - (limit * interval);

  models.Log.findAll({
    where: {
      createdAt: {
        between: [start, end]
      }
    },
    group: sequelize.fn('strftime', sequelize.literal("'%Y%m%d'"), sequelize.col('createdAt'))
  }).success(function(results) {
    res.json(results);
  });

});

module.exports = router;
