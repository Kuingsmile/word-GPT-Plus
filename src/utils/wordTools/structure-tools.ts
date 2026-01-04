import { WordToolDefinition } from './types'

export const structureTools: Record<string, WordToolDefinition> = {
  insertPageBreak: {
    name: 'insertPageBreak',
    description: 'Insert a page break at the current cursor position.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async () => {
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.insertBreak('Page', 'After')
        await context.sync()
        return 'Successfully inserted page break'
      })
    },
  },

  insertTable: {
    name: 'insertTable',
    description: 'Insert a table at the current cursor position.',
    inputSchema: {
      type: 'object',
      properties: {
        rows: {
          type: 'number',
          description: 'Number of rows in the table',
          default: 3,
        },
        columns: {
          type: 'number',
          description: 'Number of columns in the table',
          default: 3,
        },
      },
      required: [],
    },
    execute: async args => {
      const { rows = 3, columns = 3 } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        const table = range.insertTable(rows, columns, 'After')
        await context.sync()
        return `Successfully inserted ${rows}x${columns} table`
      })
    },
  },

  insertList: {
    name: 'insertList',
    description: 'Insert a bulleted or numbered list.',
    inputSchema: {
      type: 'object',
      properties: {
        listType: {
          type: 'string',
          description: 'Type of list: "bullet" or "number"',
          enum: ['bullet', 'number'],
          default: 'bullet',
        },
        items: {
          type: 'array',
          description: 'Array of list items',
          items: {
            type: 'string',
          },
        },
      },
      required: ['items'],
    },
    execute: async args => {
      const { listType = 'bullet', items } = args
      return Word.run(async context => {
        const range = context.document.getSelection()

        for (const item of items) {
          const paragraph = range.insertParagraph(item, 'After')
          if (listType === 'bullet') {
            paragraph.listFormat.applyBulletStyle()
          } else {
            paragraph.listFormat.applyNumberedStyle()
          }
        }

        await context.sync()
        return `Successfully inserted ${listType} list with ${items.length} items`
      })
    },
  },
}
