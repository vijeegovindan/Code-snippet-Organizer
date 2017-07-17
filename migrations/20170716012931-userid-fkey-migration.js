'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addConstraint(
      'snippets',
      ['userid'],
      {
        type: 'FOREIGN KEY',
        name: 'userid_fkey_constraint',
        references:{
          table: 'users',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeConstraint('snippets','userid_fkey_constraint');
  }
};
