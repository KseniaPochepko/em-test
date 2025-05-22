const types = ['Comment', 'Accept', 'Resolve', 'Reject', 'Reopen'];
export function up(queryInterface, Sequelize) {
  return queryInterface.createTable('request_actions', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: Sequelize.ENUM, values: types, allowNull: false },
    content: { type: Sequelize.TEXT, allowNull: true },
    request_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'requests' },
    },
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
  });
}
export function down(queryInterface) {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('request_actions', { transaction });
    await queryInterface.dropEnum('enum_request_actions_type', { transaction });
  });
}
