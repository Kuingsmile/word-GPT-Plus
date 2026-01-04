import { WordToolDefinition } from './types'

export const contentControlTools: Record<string, WordToolDefinition> = {
  insertContentControl: {
    name: 'insertContentControl',
    description: 'Insert a content control at the current cursor position.',
    inputSchema: {
      type: 'object',
      properties: {
        controlType: {
          type: 'string',
          description: 'Type of content control',
          enum: ['text', 'checkbox', 'dropdown', 'date'],
          default: 'text',
        },
        title: {
          type: 'string',
          description: 'Title for the content control',
        },
        placeholder: {
          type: 'string',
          description: 'Placeholder text',
        },
      },
      required: [],
    },
    execute: async args => {
      const { controlType = 'text', title, placeholder } = args
      return Word.run(async context => {
        const range = context.document.getSelection()
        const contentControl = range.insertContentControl()
        contentControl.title = title || ''
        contentControl.placeholderText = placeholder || ''

        // Set control type
        switch (controlType) {
          case 'checkbox':
            contentControl.cannotEdit = false
            contentControl.appearance = 'BoundingBox'
            break
          case 'dropdown':
            // Would need additional setup for dropdown items
            break
          case 'date':
            // Would need additional setup for date picker
            break
          default:
            contentControl.text = ''
        }

        await context.sync()
        return `Successfully inserted ${controlType} content control`
      })
    },
  },
}
