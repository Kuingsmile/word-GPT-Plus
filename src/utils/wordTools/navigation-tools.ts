import { WordToolDefinition } from './types'

export const navigationTools: Record<string, WordToolDefinition> = {
  insertBookmark: {
    name: 'insertBookmark',
    description: 'Insert a bookmark at the current cursor position.',
    inputSchema: {
      type: 'object',
      properties: {
        bookmarkName: {
          type: 'string',
          description: 'The name of the bookmark',
        },
      },
      required: ['bookmarkName'],
    },
    execute: async args => {
      const { bookmarkName } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        range.insertBookmark(bookmarkName)
        await context.sync()
        return `Successfully inserted bookmark "${bookmarkName}"`
      })
    },
  },

  goToBookmark: {
    name: 'goToBookmark',
    description: 'Navigate to a specific bookmark in the document.',
    inputSchema: {
      type: 'object',
      properties: {
        bookmarkName: {
          type: 'string',
          description: 'The name of the bookmark to navigate to',
        },
      },
      required: ['bookmarkName'],
    },
    execute: async args => {
      const { bookmarkName } = args
      return Word.run(async context => {
        const bookmarks = context.document.bookmarks
        bookmarks.load('items')
        await context.sync()

        const bookmark = bookmarks.items.find(b => b.name === bookmarkName)
        if (bookmark) {
          bookmark.select()
          await context.sync()
          return `Navigated to bookmark "${bookmarkName}"`
        }

        return `Bookmark "${bookmarkName}" not found`
      })
    },
  },
}
