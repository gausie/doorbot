"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
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
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Card, {
          foreignKey: 'UserId'
        });
      }
    }
  });

  return User;
};
