"use strict";

module.exports = function(sequelize, DataTypes) {
  var Setting = sequelize.define('Setting', {
    key: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    value: DataTypes.STRING
  });

  return Setting;
};
