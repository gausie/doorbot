"use strict";

module.exports = function(sequelize, DataTypes) {
  var Log = sequelize.define("Log", {
    id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    CardUid: DataTypes.STRING
  }, {
    updatedAt: false,
    classMethods: {
      associate: function(models) {
        Log.belongsTo(models.Card);
      }
    }
  });

  return Log;
};
