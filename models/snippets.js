'use strict';
module.exports = function(sequelize, DataTypes) {
  var snippets = sequelize.define('snippets', {
    userid: DataTypes.INTEGER,
    title: DataTypes.STRING,
    body: DataTypes.TEXT,
    notes: DataTypes.TEXT,
    language: DataTypes.STRING,
    tags: DataTypes.ARRAY(DataTypes.STRING)
  }, {});

  snippets.associate = function(models){
    snippets.belongsTo(models.users, {as:'user_snippets', foreignKey:'userid'});
  }

  return snippets;
};
