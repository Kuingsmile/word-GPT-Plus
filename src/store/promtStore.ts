import Dexie, { Table } from 'dexie'

/*
 * create a database for prompt and system
 *database name: prompt
 *structure:
 * - table: prompt, system
 * - key: string of prompt name
 * - value: prompt object
 * - primaryKey: key
 */

export interface IPrompt {
  key: string
  value: string
}

export class PromptDb extends Dexie {
  userPrompt: Table<IPrompt, string>
  systemPrompt: Table<IPrompt, string>

  constructor() {
    super('promptDb')
    const tableNames = ['userPrompt', 'systemPrompt']
    const tableNamesMap = tableNames.reduce((acc, cur) => {
      acc[cur] = '&key, value'
      return acc
    }, {} as IStringKeyMap)
    this.version(1).stores(tableNamesMap)
    this.userPrompt = this.table('userPrompt')
    this.systemPrompt = this.table('systemPrompt')
  }
}

export const promptDbInstance = new PromptDb()
