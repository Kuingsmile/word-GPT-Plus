import { WordToolDefinition } from './types'

export const documentTools: Record<string, WordToolDefinition> = {
  getDocumentProperties: {
    name: 'getDocumentProperties',
    description: 'Get properties of the current Word document.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async () => {
      return Word.run(async context => {
        const properties = context.document.properties
        properties.load('title, subject, author, created, lastSaved, wordCount')
        await context.sync()

        return JSON.stringify({
          title: properties.title,
          subject: properties.subject,
          author: properties.author,
          created: properties.created?.toString(),
          lastSaved: properties.lastSaved?.toString(),
          wordCount: properties.wordCount,
        })
      })
    },
  },

  getRangeInfo: {
    name: 'getRangeInfo',
    description: 'Get information about the current selection range.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async () => {
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.load('text, font, style, paragraphFormat')
        await context.sync()

        return JSON.stringify({
          text: range.text,
          font: {
            name: range.font.name,
            size: range.font.size,
            bold: range.font.bold,
            italic: range.font.italic,
          },
          style: range.style,
          alignment: range.paragraphFormat.alignment,
        })
      })
    },
  },

  selectText: {
    name: 'selectText',
    description: 'Select specific text in the document.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to select',
        },
        matchCase: {
          type: 'boolean',
          description: 'Whether to match case',
          default: false,
        },
      },
      required: ['text'],
    },
    execute: async args => {
      const { text, matchCase = false } = args
      return Word.run(async context => {
        const searchResults = context.document.body.search(text, { matchCase })
        searchResults.load('items')
        await context.sync()

        if (searchResults.items.length === 0) {
          return 'No matches found'
        }

        searchResults.items[0].select()
        await context.sync()
        return `Selected first occurrence of "${text}"`
      })
    },
  },

  findText: {
    name: 'findText',
    description: 'Find text in the document and return its position.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to find',
        },
        matchCase: {
          type: 'boolean',
          description: 'Whether to match case',
          default: false,
        },
      },
      required: ['text'],
    },
    execute: async args => {
      const { text, matchCase = false } = args
      return Word.run(async context => {
        const searchResults = context.document.body.search(text, { matchCase })
        searchResults.load('items')
        await context.sync()

        return `Found ${searchResults.items.length} occurrences of "${text}"`
      })
    },
  },
}
