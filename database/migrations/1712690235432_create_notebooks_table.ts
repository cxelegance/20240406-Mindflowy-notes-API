import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notebooks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable();

      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('description').nullable();

      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').notNullable();
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
