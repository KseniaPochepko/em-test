const statuses = ['Pending', 'InProgress', 'Resolved', 'Rejected'];

export function up(queryInterface, Sequelize) {
  return queryInterface.createTable('requests', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: Sequelize.STRING, allowNull: false },
    content: { type: Sequelize.TEXT, allowNull: false },
    status: { type: Sequelize.ENUM, values: statuses, allowNull: false, defaultValue: 'Pending' },
    created_at: { type: Sequelize.DATE, allowNull: false },
    updated_at: { type: Sequelize.DATE, allowNull: false },
  });
}
export function down(queryInterface) {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('requests', { transaction });
    await queryInterface.dropEnum('enum_requests_status', { transaction });
  });
}
