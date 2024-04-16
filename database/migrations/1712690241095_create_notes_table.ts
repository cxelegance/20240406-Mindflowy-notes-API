import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable();

      table.integer('mindstack_id').unsigned().notNullable().references('mindstacks.id').onDelete('CASCADE');
      table.integer('prev_sibling').unsigned().nullable().references('notes.id').onDelete('SET NULL');
      table.integer('parent').unsigned().nullable().references('notes.id').onDelete('CASCADE');
      table.text('data').nullable();

      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').notNullable();
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
