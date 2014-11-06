/*
 * Serve JSON to our AngularJS client
 */
var sequelize = require('sequelize');
var models = require('../models');
var express = require('express');
var router = express.Router();
var _ = require('lodash');

router.get('/users', function(req, res, next) {
  models.User.findAll({
    attributes: ['id', 'name', 'email', 'resident', 'notify', 'enabled', [sequelize.fn('COUNT', 'Card.id'), 'CardCount']],
    group: 'User.id',
    include: [{
      model: models.Card,
      attributes: []
    }]
  }).success(function(users) {
    res.json(users);
  });
});

router.get('/users/:user', function(req, res) {
  models.User.find({
    where: { id: req.params.user },
    include: [ models.Card ]
  }).success(function(users) {
    res.json(users);
  }).error(function(err) {
    next(err);
  });
});

router.post('/users/', function(req, res, next) {
  models.User.build(req.body).save().success(function(user) {
    res.json(user);
  }).error(function(err) {
    next(err);
  });
});

router.delete('/users/:user', function(req, res, next) {
  var UserId = req.params.user;
  models.User.find(UserId).success(function(user) {
    user.destroy().success(function() {
      models.Card.destroy({
        UserId: UserId
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
  }).then(function (users) {
    var attributes = _.clone(req.body);
    delete attributes.Cards;
    return users.updateAttributes(attributes);
  }).then(function(results) {

    // Delete cards for this user
    models.Card.destroy({
      where: { UserId: req.params.user }
    });

    // Add the cards in the form
    req.body.Cards.forEach(function(card) {
      card.UserId = req.params.user;
      models.Card.create(card);
    });

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
