"use strict";

module.exports = function(sequelize, DataTypes) {
  var Card = sequelize.define('Card', {
    uid: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    UserId: DataTypes.INTEGER,
    description: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Card.belongsTo(models.User);
      }
    }
  });

  Card.hook('beforeCreate', function(attributes, options, fn) {
    attributes.setDataValue('uid', attributes.get('uid').toLowerCase());
    fn();
  });

  return Card;
};
