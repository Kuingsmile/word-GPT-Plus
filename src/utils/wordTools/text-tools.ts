import { WordToolDefinition } from './types'

export const textTools: Record<string, WordToolDefinition> = {
  getSelectedText: {
    name: 'getSelectedText',
    description:
      'Get the currently selected text in the Word document. Returns the selected text or empty string if nothing is selected.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async () => {
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.load('text')
        await context.sync()
        return range.text || ''
      })
    },
  },

  getDocumentContent: {
    name: 'getDocumentContent',
    description: 'Get the full content of the Word document body as plain text.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async () => {
      return Word.run(async context => {
        const body = context.document.body
        body.load('text')
        await context.sync()
        return body.text || ''
      })
    },
  },

  insertText: {
    name: 'insertText',
    description: 'Insert text at the current cursor position in the Word document.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to insert',
        },
        location: {
          type: 'string',
          description: 'Where to insert: "Start", "End", "Before", "After", or "Replace"',
          enum: ['Start', 'End', 'Before', 'After', 'Replace'],
        },
      },
      required: ['text'],
    },
    execute: async args => {
      const { text, location = 'End' } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.insertText(text, location as Word.InsertLocation)
        await context.sync()
        return `Successfully inserted text at ${location}`
      })
    },
  },

  replaceSelectedText: {
    name: 'replaceSelectedText',
    description: 'Replace the currently selected text with new text.',
    inputSchema: {
      type: 'object',
      properties: {
        newText: {
          type: 'string',
          description: 'The new text to replace the selected text',
        },
      },
      required: ['newText'],
    },
    execute: async args => {
      const { newText } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.insertText(newText, 'Replace')
        await context.sync()
        return 'Successfully replaced selected text'
      })
    },
  },

  appendText: {
    name: 'appendText',
    description: 'Append text to the end of the current selection or document.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to append',
        },
      },
      required: ['text'],
    },
    execute: async args => {
      const { text } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.insertText(text, 'After')
        await context.sync()
        return 'Successfully appended text'
      })
    },
  },

  insertParagraph: {
    name: 'insertParagraph',
    description: 'Insert a new paragraph at the current cursor position.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text for the new paragraph',
        },
      },
      required: [],
    },
    execute: async args => {
      const { text = '' } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        const paragraph = range.insertParagraph(text, 'After')
        await context.sync()
        return 'Successfully inserted paragraph'
      })
    },
  },

  searchAndReplace: {
    name: 'searchAndReplace',
    description: 'Search for text in the document and replace it with new text.',
    inputSchema: {
      type: 'object',
      properties: {
        searchText: {
          type: 'string',
          description: 'The text to search for',
        },
        replaceText: {
          type: 'string',
          description: 'The text to replace with',
        },
        matchCase: {
          type: 'boolean',
          description: 'Whether to match case',
          default: false,
        },
      },
      required: ['searchText', 'replaceText'],
    },
    execute: async args => {
      const { searchText, replaceText, matchCase = false } = args
      return Word.run(async context => {
        const searchResults = context.document.body.search(searchText, { matchCase })
        searchResults.load('items')
        await context.sync()

        if (searchResults.items.length === 0) {
          return 'No matches found'
        }

        for (let i = 0; i < searchResults.items.length; i++) {
          searchResults.items[i].insertText(replaceText, 'Replace')
        }
        await context.sync()
        return `Replaced ${searchResults.items.length} occurrences of "${searchText}"`
      })
    },
  },

  deleteText: {
    name: 'deleteText',
    description: 'Delete the currently selected text.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async () => {
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.delete()
        await context.sync()
        return 'Successfully deleted selected text'
      })
    },
  },
}
