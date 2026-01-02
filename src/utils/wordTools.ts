import { tool } from '@langchain/core/tools'
import { z } from 'zod'

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
  | 'deleteText'
  | 'clearFormatting'
  | 'setFontName'
  | 'insertPageBreak'
  | 'getRangeInfo'
  | 'selectText'
  | 'insertImage'
  | 'getTableInfo'
  | 'insertBookmark'
  | 'goToBookmark'
  | 'insertContentControl'
  | 'findText'

const wordToolDefinitions: Record<WordToolName, WordToolDefinition> = {
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
          description: 'The new text to replace the selection with',
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
    description: 'Append text to the end of the document.',
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
        const body = context.document.body
        body.insertText(text, 'End')
        await context.sync()
        return 'Successfully appended text to document'
      })
    },
  },

  insertParagraph: {
    name: 'insertParagraph',
    description: 'Insert a new paragraph at the specified location.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The paragraph text',
        },
        location: {
          type: 'string',
          description:
            'Where to insert: "After" (after cursor/selection), "Before" (before cursor), "Start" (start of doc), or "End" (end of doc). Default is "After".',
          enum: ['After', 'Before', 'Start', 'End'],
        },
        style: {
          type: 'string',
          description: 'Optional Word built-in style: Normal, Heading1, Heading2, Heading3, Quote, etc.',
          enum: [
            'Normal',
            'Heading1',
            'Heading2',
            'Heading3',
            'Heading4',
            'Quote',
            'IntenseQuote',
            'Title',
            'Subtitle',
          ],
        },
      },
      required: ['text'],
    },
    execute: async args => {
      const { text, location = 'After', style } = args
      return Word.run(async context => {
        let paragraph
        if (location === 'Start' || location === 'End') {
          const body = context.document.body
          paragraph = body.insertParagraph(text, location)
        } else {
          const range = context.document.getSelection()
          paragraph = range.insertParagraph(text, location as 'After' | 'Before')
        }
        if (style) {
          paragraph.styleBuiltIn = style as Word.BuiltInStyleName
        }
        await context.sync()
        return `Successfully inserted paragraph at ${location}`
      })
    },
  },

  formatText: {
    name: 'formatText',
    description: 'Apply formatting to the currently selected text.',
    inputSchema: {
      type: 'object',
      properties: {
        bold: {
          type: 'boolean',
          description: 'Make text bold',
        },
        italic: {
          type: 'boolean',
          description: 'Make text italic',
        },
        underline: {
          type: 'boolean',
          description: 'Underline text',
        },
        fontSize: {
          type: 'number',
          description: 'Font size in points',
        },
        fontColor: {
          type: 'string',
          description: 'Font color as hex (e.g., "#FF0000" for red)',
        },
        highlightColor: {
          type: 'string',
          description:
            'Highlight color: Yellow, Green, Cyan, Pink, Blue, Red, DarkBlue, Teal, Lime, Purple, Orange, etc.',
        },
      },
      required: [],
    },
    execute: async args => {
      const { bold, italic, underline, fontSize, fontColor, highlightColor } = args
      return Word.run(async context => {
        const range = context.document.getSelection()

        if (bold !== undefined) range.font.bold = bold
        if (italic !== undefined) range.font.italic = italic
        if (underline !== undefined) range.font.underline = underline ? 'Single' : 'None'
        if (fontSize !== undefined) range.font.size = fontSize
        if (fontColor !== undefined) range.font.color = fontColor
        if (highlightColor !== undefined) range.font.highlightColor = highlightColor

        await context.sync()
        return 'Successfully applied formatting'
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
          description: 'Whether to match case (default: false)',
        },
        matchWholeWord: {
          type: 'boolean',
          description: 'Whether to match whole word only (default: false)',
        },
      },
      required: ['searchText', 'replaceText'],
    },
    execute: async args => {
      const { searchText, replaceText, matchCase = false, matchWholeWord = false } = args
      return Word.run(async context => {
        const body = context.document.body
        const searchResults = body.search(searchText, {
          matchCase,
          matchWholeWord,
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
    },
  },

  getDocumentProperties: {
    name: 'getDocumentProperties',
    description: 'Get document properties including paragraph count, word count, and character count.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async () => {
      return Word.run(async context => {
        const body = context.document.body
        body.load(['text'])

        const paragraphs = body.paragraphs
        paragraphs.load('items')

        await context.sync()

        const text = body.text || ''
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
        const charCount = text.length
        const paragraphCount = paragraphs.items.length

        return JSON.stringify(
          {
            paragraphCount,
            wordCount,
            characterCount: charCount,
          },
          null,
          2,
        )
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
          description: 'Number of rows',
        },
        columns: {
          type: 'number',
          description: 'Number of columns',
        },
        data: {
          type: 'array',
          description: 'Optional 2D array of cell values',
          items: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      required: ['rows', 'columns'],
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
    },
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
          items: { type: 'string' },
        },
        listType: {
          type: 'string',
          description: 'Type of list: "bullet" or "number"',
          enum: ['bullet', 'number'],
        },
      },
      required: ['items', 'listType'],
    },
    execute: async args => {
      const { items, listType } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        let insertionPoint = range

        for (const item of items) {
          const paragraph = insertionPoint.insertParagraph(item, 'After')

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
    },
  },

  deleteText: {
    name: 'deleteText',
    description:
      'Delete the currently selected text or a specific range. If no text is selected, this will delete at the cursor position.',
    inputSchema: {
      type: 'object',
      properties: {
        direction: {
          type: 'string',
          description: 'Direction to delete if nothing selected: "Before" (backspace) or "After" (delete key)',
          enum: ['Before', 'After'],
        },
      },
      required: [],
    },
    execute: async args => {
      const { direction = 'After' } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.load('text')
        await context.sync()

        if (range.text && range.text.length > 0) {
          range.delete()
        } else {
          if (direction === 'After') {
            range.insertText('', 'After')
          } else {
            range.insertText('', 'Before')
          }
        }
        await context.sync()
        return 'Successfully deleted text'
      })
    },
  },

  clearFormatting: {
    name: 'clearFormatting',
    description: 'Clear all formatting from the selected text, returning it to default style.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async () => {
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.font.bold = false
        range.font.italic = false
        range.font.underline = 'None'
        range.styleBuiltIn = 'Normal'
        await context.sync()
        return 'Successfully cleared formatting'
      })
    },
  },

  setFontName: {
    name: 'setFontName',
    description: 'Set the font name/family for the selected text (e.g., Arial, Times New Roman, Calibri).',
    inputSchema: {
      type: 'object',
      properties: {
        fontName: {
          type: 'string',
          description: 'The font name to apply (e.g., "Arial", "Times New Roman", "Calibri", "Consolas")',
        },
      },
      required: ['fontName'],
    },
    execute: async args => {
      const { fontName } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.font.name = fontName
        await context.sync()
        return `Successfully set font to ${fontName}`
      })
    },
  },

  insertPageBreak: {
    name: 'insertPageBreak',
    description: 'Insert a page break at the current cursor position.',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'Where to insert: "Before", "After", "Start", or "End"',
          enum: ['Before', 'After', 'Start', 'End'],
        },
      },
      required: [],
    },
    execute: async args => {
      const { location = 'After' } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        // insertBreak only supports Before and After for page breaks
        const insertLoc = location === 'Start' || location === 'Before' ? 'Before' : 'After'
        range.insertBreak('Page', insertLoc)
        await context.sync()
        return `Successfully inserted page break ${location.toLowerCase()}`
      })
    },
  },

  getRangeInfo: {
    name: 'getRangeInfo',
    description: 'Get detailed information about the current selection including text, formatting, and position.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async () => {
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.load([
          'text',
          'style',
          'font/name',
          'font/size',
          'font/bold',
          'font/italic',
          'font/underline',
          'font/color',
        ])
        await context.sync()

        return JSON.stringify(
          {
            text: range.text || '',
            style: range.style,
            font: {
              name: range.font.name,
              size: range.font.size,
              bold: range.font.bold,
              italic: range.font.italic,
              underline: range.font.underline,
              color: range.font.color,
            },
          },
          null,
          2,
        )
      })
    },
  },

  selectText: {
    name: 'selectText',
    description: 'Select all text in the document or specific location.',
    inputSchema: {
      type: 'object',
      properties: {
        scope: {
          type: 'string',
          description: 'What to select: "All" for entire document',
          enum: ['All'],
        },
      },
      required: ['scope'],
    },
    execute: async args => {
      const { scope } = args
      return Word.run(async context => {
        if (scope === 'All') {
          const body = context.document.body
          body.select()
          await context.sync()
          return 'Successfully selected all text'
        }
        return 'Invalid scope'
      })
    },
  },

  insertImage: {
    name: 'insertImage',
    description: 'Insert an image from a URL at the current cursor position. The image URL must be accessible.',
    inputSchema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          description: 'The URL of the image to insert',
        },
        width: {
          type: 'number',
          description: 'Optional width in points',
        },
        height: {
          type: 'number',
          description: 'Optional height in points',
        },
        location: {
          type: 'string',
          description: 'Where to insert: "Before", "After", "Start", "End", or "Replace"',
          enum: ['Before', 'After', 'Start', 'End', 'Replace'],
        },
      },
      required: ['imageUrl'],
    },
    execute: async args => {
      const { imageUrl, width, height, location = 'After' } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        const image = range.insertInlinePictureFromBase64(imageUrl, location as Word.InsertLocation)

        if (width) image.width = width
        if (height) image.height = height

        await context.sync()
        return `Successfully inserted image at ${location}`
      })
    },
  },

  getTableInfo: {
    name: 'getTableInfo',
    description: 'Get information about tables in the document, including row and column counts.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async () => {
      return Word.run(async context => {
        const tables = context.document.body.tables
        tables.load(['items'])
        await context.sync()

        const tableInfos = []
        for (let i = 0; i < tables.items.length; i++) {
          const table = tables.items[i]
          table.load(['rowCount', 'values'])
          await context.sync()

          const columnCount = table.values && table.values[0] ? table.values[0].length : 0

          tableInfos.push({
            index: i,
            rowCount: table.rowCount,
            columnCount,
          })
        }

        return JSON.stringify(
          {
            tableCount: tables.items.length,
            tables: tableInfos,
          },
          null,
          2,
        )
      })
    },
  },

  insertBookmark: {
    name: 'insertBookmark',
    description: 'Insert a bookmark at the current selection to mark a location in the document.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the bookmark (must be unique, no spaces allowed)',
        },
      },
      required: ['name'],
    },
    execute: async args => {
      const { name } = args
      return Word.run(async context => {
        const range = context.document.getSelection()

        const bookmarkName = name.replace(/\s+/g, '_')

        const contentControl = range.insertContentControl()
        contentControl.tag = `bookmark_${bookmarkName}`
        contentControl.title = bookmarkName
        contentControl.appearance = 'Tags'

        await context.sync()
        return `Successfully inserted bookmark: ${bookmarkName}`
      })
    },
  },

  goToBookmark: {
    name: 'goToBookmark',
    description: 'Navigate to a previously created bookmark in the document.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the bookmark to navigate to',
        },
      },
      required: ['name'],
    },
    execute: async args => {
      const { name } = args
      return Word.run(async context => {
        const bookmarkName = name.replace(/\s+/g, '_')
        const contentControls = context.document.contentControls
        contentControls.load(['items'])
        await context.sync()

        for (const cc of contentControls.items) {
          cc.load(['tag', 'title'])
          await context.sync()

          if (cc.tag === `bookmark_${bookmarkName}` || cc.title === bookmarkName) {
            cc.select()
            await context.sync()
            return `Successfully navigated to bookmark: ${bookmarkName}`
          }
        }

        return `Bookmark not found: ${bookmarkName}`
      })
    },
  },

  insertContentControl: {
    name: 'insertContentControl',
    description:
      'Insert a content control (a container for content) at the current selection. Useful for creating structured documents.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the content control',
        },
        tag: {
          type: 'string',
          description: 'Optional tag for programmatic identification',
        },
        appearance: {
          type: 'string',
          description: 'Visual appearance of the control',
          enum: ['BoundingBox', 'Tags', 'Hidden'],
        },
      },
      required: ['title'],
    },
    execute: async args => {
      const { title, tag, appearance = 'BoundingBox' } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        const contentControl = range.insertContentControl()
        contentControl.title = title
        if (tag) contentControl.tag = tag
        contentControl.appearance = appearance as Word.ContentControlAppearance

        await context.sync()
        return `Successfully inserted content control: ${title}`
      })
    },
  },

  findText: {
    name: 'findText',
    description: 'Find text in the document and return information about matches. Does not modify the document.',
    inputSchema: {
      type: 'object',
      properties: {
        searchText: {
          type: 'string',
          description: 'The text to search for',
        },
        matchCase: {
          type: 'boolean',
          description: 'Whether to match case (default: false)',
        },
        matchWholeWord: {
          type: 'boolean',
          description: 'Whether to match whole word only (default: false)',
        },
      },
      required: ['searchText'],
    },
    execute: async args => {
      const { searchText, matchCase = false, matchWholeWord = false } = args
      return Word.run(async context => {
        const body = context.document.body
        const searchResults = body.search(searchText, {
          matchCase,
          matchWholeWord,
        })
        searchResults.load(['items'])
        await context.sync()

        const count = searchResults.items.length
        return JSON.stringify(
          {
            searchText,
            matchCount: count,
            found: count > 0,
          },
          null,
          2,
        )
      })
    },
  },
}

export function createWordTools(enabledTools?: WordToolName[]) {
  const tools = Object.entries(wordToolDefinitions)
    .filter(([name]) => !enabledTools || enabledTools.includes(name as WordToolName))
    .map(([, def]) => {
      const schemaObj: Record<string, z.ZodTypeAny> = {}

      for (const [propName, prop] of Object.entries(def.inputSchema.properties)) {
        let zodType: z.ZodTypeAny

        switch (prop.type) {
          case 'string':
            zodType = prop.enum ? z.enum(prop.enum as [string, ...string[]]) : z.string()
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
          schema: z.object(schemaObj),
        },
      )
    })

  return tools
}

export function getWordToolDefinitions(): WordToolDefinition[] {
  return Object.values(wordToolDefinitions)
}

export function getWordTool(name: WordToolName): WordToolDefinition | undefined {
  return wordToolDefinitions[name]
}

export { wordToolDefinitions }
