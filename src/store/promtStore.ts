import Dexie, { Table } from 'dexie'

export interface IPrompt {
  key: string
  value: string
}

export class PromptDb extends Dexie {
  userPrompt: Table<IPrompt, string>
  systemPrompt: Table<IPrompt, string>

  constructor() {
    super('promptDb')
    const tableSchema = '&key, value'

    this.version(1).stores({
      userPrompt: tableSchema,
      systemPrompt: tableSchema
    })

    this.userPrompt = this.table('userPrompt')
    this.systemPrompt = this.table('systemPrompt')
  }
}

export const promptDbInstance = new PromptDb()
