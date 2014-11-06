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

  return Card;
};
