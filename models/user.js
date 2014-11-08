module.exports = function (sequelize, DataTypes) {

  'use strict';

  var User = sequelize.define('User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      resident: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      notify: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      classMethods: {
        associate: function (models) {
          User.hasMany(models.Card, {
            foreignKey: 'UserId'
          });
        }
      }
    }
  );

  var processUserCards = function(user) {

    var Card = sequelize.model('Card');

    // Delete cards for this user
    Card.destroy({
      where: { UserId: user.id }
    });

    // Add the cards in the form
    user.Cards.forEach(function(card) {
      card.isNewRecord = true;
      card.set('UserId', user.id).save();
    });

  };

  User.hook('afterUpdate', function(user) {
    if(user.Cards) {
      processUserCards(user);
    }
  });

  User.hook('afterCreate', function(user) {
    if(user.Cards) {
      processUserCards(user);
    }
  });

  return User;
};
