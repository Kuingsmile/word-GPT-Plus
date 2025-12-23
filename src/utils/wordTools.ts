// Word Tools - Built-in tools for LLM to interact with Word document
import { WordToolDefinition } from '@/types/mcp'
import { tool } from '@langchain/core/tools'
import { z } from 'zod'

// Built-in Word tools
export type WordToolName =
  | 'getSelectedText'
  | 'getDocumentContent'
  | 'insertText'
  | 'replaceSelectedText'
  | 'appendText'
  | 'insertParagraph'
  | 'formatText'
  | 'searchAndReplace'
  | 'getDocumentProperties'
  | 'insertTable'
  | 'insertList'

// Tool definitions with schemas and implementations
const wordToolDefinitions: Record<WordToolName, WordToolDefinition> = {
  getSelectedText: {
    name: 'getSelectedText',
    description:
      'Get the currently selected text in the Word document. Returns the selected text or empty string if nothing is selected.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    execute: async () => {
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.load('text')
        await context.sync()
        return range.text || ''
      })
    }
  },

  getDocumentContent: {
    name: 'getDocumentContent',
    description:
      'Get the full content of the Word document body as plain text.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    execute: async () => {
      return Word.run(async context => {
        const body = context.document.body
        body.load('text')
        await context.sync()
        return body.text || ''
      })
    }
  },

  insertText: {
    name: 'insertText',
    description:
      'Insert text at the current cursor position in the Word document.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to insert'
        },
        location: {
          type: 'string',
          description:
            'Where to insert: "Start", "End", "Before", "After", or "Replace"',
          enum: ['Start', 'End', 'Before', 'After', 'Replace']
        }
      },
      required: ['text']
    },
    execute: async args => {
      const { text, location = 'End' } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.insertText(text, location as Word.InsertLocation)
        await context.sync()
        return `Successfully inserted text at ${location}`
      })
    }
  },

  replaceSelectedText: {
    name: 'replaceSelectedText',
    description: 'Replace the currently selected text with new text.',
    inputSchema: {
      type: 'object',
      properties: {
        newText: {
          type: 'string',
          description: 'The new text to replace the selection with'
        }
      },
      required: ['newText']
    },
    execute: async args => {
      const { newText } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.insertText(newText, 'Replace')
        await context.sync()
        return 'Successfully replaced selected text'
      })
    }
  },

  appendText: {
    name: 'appendText',
    description: 'Append text to the end of the document.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to append'
        }
      },
      required: ['text']
    },
    execute: async args => {
      const { text } = args
      return Word.run(async context => {
        const body = context.document.body
        body.insertText(text, 'End')
        await context.sync()
        return 'Successfully appended text to document'
      })
    }
  },

  insertParagraph: {
    name: 'insertParagraph',
    description: 'Insert a new paragraph at the specified location.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The paragraph text'
        },
        location: {
          type: 'string',
          description: 'Where to insert: "Start" or "End" of the document',
          enum: ['Start', 'End']
        },
        style: {
          type: 'string',
          description:
            'Optional Word built-in style: Normal, Heading1, Heading2, Heading3, Quote, etc.',
          enum: [
            'Normal',
            'Heading1',
            'Heading2',
            'Heading3',
            'Heading4',
            'Quote',
            'IntenseQuote',
            'Title',
            'Subtitle'
          ]
        }
      },
      required: ['text']
    },
    execute: async args => {
      const { text, location = 'End', style } = args
      return Word.run(async context => {
        const body = context.document.body
        const paragraph = body.insertParagraph(
          text,
          location as 'Start' | 'End'
        )
        if (style) {
          paragraph.styleBuiltIn = style as Word.BuiltInStyleName
        }
        await context.sync()
        return `Successfully inserted paragraph at ${location}`
      })
    }
  },

  formatText: {
    name: 'formatText',
    description: 'Apply formatting to the currently selected text.',
    inputSchema: {
      type: 'object',
      properties: {
        bold: {
          type: 'boolean',
          description: 'Make text bold'
        },
        italic: {
          type: 'boolean',
          description: 'Make text italic'
        },
        underline: {
          type: 'boolean',
          description: 'Underline text'
        },
        fontSize: {
          type: 'number',
          description: 'Font size in points'
        },
        fontColor: {
          type: 'string',
          description: 'Font color as hex (e.g., "#FF0000" for red)'
        },
        highlightColor: {
          type: 'string',
          description:
            'Highlight color: Yellow, Green, Cyan, Pink, Blue, Red, DarkBlue, Teal, Lime, Purple, Orange, etc.'
        }
      },
      required: []
    },
    execute: async args => {
      const { bold, italic, underline, fontSize, fontColor, highlightColor } =
        args
      return Word.run(async context => {
        const range = context.document.getSelection()

        if (bold !== undefined) range.font.bold = bold
        if (italic !== undefined) range.font.italic = italic
        if (underline !== undefined)
          range.font.underline = underline ? 'Single' : 'None'
        if (fontSize !== undefined) range.font.size = fontSize
        if (fontColor !== undefined) range.font.color = fontColor
        if (highlightColor !== undefined)
          range.font.highlightColor = highlightColor

        await context.sync()
        return 'Successfully applied formatting'
      })
    }
  },

  searchAndReplace: {
    name: 'searchAndReplace',
    description:
      'Search for text in the document and replace it with new text.',
    inputSchema: {
      type: 'object',
      properties: {
        searchText: {
          type: 'string',
          description: 'The text to search for'
        },
        replaceText: {
          type: 'string',
          description: 'The text to replace with'
        },
        matchCase: {
          type: 'boolean',
          description: 'Whether to match case (default: false)'
        },
        matchWholeWord: {
          type: 'boolean',
          description: 'Whether to match whole word only (default: false)'
        }
      },
      required: ['searchText', 'replaceText']
    },
    execute: async args => {
      const {
        searchText,
        replaceText,
        matchCase = false,
        matchWholeWord = false
      } = args
      return Word.run(async context => {
        const body = context.document.body
        const searchResults = body.search(searchText, {
          matchCase,
          matchWholeWord
        })
        searchResults.load('items')
        await context.sync()

        const count = searchResults.items.length
        for (const item of searchResults.items) {
          item.insertText(replaceText, 'Replace')
        }
        await context.sync()
        return `Replaced ${count} occurrence(s) of "${searchText}" with "${replaceText}"`
      })
    }
  },

  getDocumentProperties: {
    name: 'getDocumentProperties',
    description:
      'Get document properties including paragraph count, word count, and character count.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    execute: async () => {
      return Word.run(async context => {
        const body = context.document.body
        body.load(['text'])

        const paragraphs = body.paragraphs
        paragraphs.load('items')

        await context.sync()

        const text = body.text || ''
        const wordCount = text
          .split(/\s+/)
          .filter(word => word.length > 0).length
        const charCount = text.length
        const paragraphCount = paragraphs.items.length

        return JSON.stringify(
          {
            paragraphCount,
            wordCount,
            characterCount: charCount
          },
          null,
          2
        )
      })
    }
  },

  insertTable: {
    name: 'insertTable',
    description: 'Insert a table at the current cursor position.',
    inputSchema: {
      type: 'object',
      properties: {
        rows: {
          type: 'number',
          description: 'Number of rows'
        },
        columns: {
          type: 'number',
          description: 'Number of columns'
        },
        data: {
          type: 'array',
          description: 'Optional 2D array of cell values',
          items: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      required: ['rows', 'columns']
    },
    execute: async args => {
      const { rows, columns, data } = args
      return Word.run(async context => {
        const range = context.document.getSelection()

        // Create table data
        const tableData: string[][] =
          data ||
          Array(rows)
            .fill(null)
            .map(() => Array(columns).fill(''))

        const table = range.insertTable(rows, columns, 'After', tableData)
        table.styleBuiltIn = 'GridTable1Light'

        await context.sync()
        return `Successfully inserted ${rows}x${columns} table`
      })
    }
  },

  insertList: {
    name: 'insertList',
    description: 'Insert a bulleted or numbered list at the current position.',
    inputSchema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          description: 'Array of list item texts',
          items: { type: 'string' }
        },
        listType: {
          type: 'string',
          description: 'Type of list: "bullet" or "number"',
          enum: ['bullet', 'number']
        }
      },
      required: ['items', 'listType']
    },
    execute: async args => {
      const { items, listType } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        let insertionPoint = range

        for (let i = 0; i < items.length; i++) {
          const paragraph = insertionPoint.insertParagraph(items[i], 'After')

          if (listType === 'bullet') {
            paragraph.listItem.level = 0
          } else {
            paragraph.listItem.level = 0
          }

          insertionPoint = paragraph.getRange('End')
        }

        await context.sync()
        return `Successfully inserted ${listType} list with ${items.length} items`
      })
    }
  }
}

// Convert to LangChain tools
export function createWordTools(enabledTools?: WordToolName[]) {
  const tools = Object.entries(wordToolDefinitions)
    .filter(
      ([name]) => !enabledTools || enabledTools.includes(name as WordToolName)
    )
    .map(([, def]) => {
      // Create zod schema from our definition
      const schemaObj: Record<string, z.ZodTypeAny> = {}

      for (const [propName, prop] of Object.entries(
        def.inputSchema.properties
      )) {
        let zodType: z.ZodTypeAny

        switch (prop.type) {
          case 'string':
            zodType = prop.enum
              ? z.enum(prop.enum as [string, ...string[]])
              : z.string()
            break
          case 'number':
            zodType = z.number()
            break
          case 'boolean':
            zodType = z.boolean()
            break
          case 'array':
            zodType = z.array(z.any())
            break
          default:
            zodType = z.any()
        }

        if (prop.description) {
          zodType = zodType.describe(prop.description)
        }

        if (!def.inputSchema.required?.includes(propName)) {
          zodType = zodType.optional()
        }

        schemaObj[propName] = zodType
      }

      return tool(
        async input => {
          try {
            return await def.execute(input)
          } catch (error: any) {
            return `Error: ${error.message || 'Unknown error occurred'}`
          }
        },
        {
          name: def.name,
          description: def.description,
          schema: z.object(schemaObj)
        }
      )
    })

  return tools
}

// Get all available Word tool definitions
export function getWordToolDefinitions(): WordToolDefinition[] {
  return Object.values(wordToolDefinitions)
}

// Get specific tool by name
export function getWordTool(
  name: WordToolName
): WordToolDefinition | undefined {
  return wordToolDefinitions[name]
}

export { wordToolDefinitions }
