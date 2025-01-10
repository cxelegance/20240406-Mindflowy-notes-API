import { DateTime } from 'luxon'
import type { HasMany } from '@adonisjs/lucid/types/relations';
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Note from '#models/note';

export default class Notebook extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Note, {
    // foreignKey: 'notebook_id',
  })
  declare notes: HasMany<typeof Note>

}
