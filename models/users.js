'use strict';
module.exports = function(sequelize, DataTypes) {
  var users = sequelize.define('users', {
    username: DataTypes.STRING,
    salt: DataTypes.STRING,
    hash: DataTypes.TEXT,
    iteration: DataTypes.INTEGER
  }, {});

users.associate = function(models){
  users.hasMany(models.snippets, {as:'user_snippets', foreignKey:'userid'});
}
  return users;
};
