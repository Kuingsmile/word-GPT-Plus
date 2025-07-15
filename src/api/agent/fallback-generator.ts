import { AgentStep } from './types'

export class FallbackStepGenerator {

  static createFallbackSteps(userMessage: string, agentMode: string): AgentStep[] {
    const lowerMessage = userMessage.toLowerCase()
    
    if (agentMode === 'writing-coach' || agentMode === 'document-analyzer') {
      if (lowerMessage.includes('write') && lowerMessage.includes('article')) {
        return this.createArticleWritingSteps(userMessage)
      }
    }
    
    if (agentMode === 'research-assistant') {
      if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis') || lowerMessage.includes('research')) {
        return this.createResearchSteps()
      }
    }
    
    if (lowerMessage.includes('write') && lowerMessage.includes('article')) {
      return this.createArticleWritingSteps(userMessage)
    } else if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) {
      return this.createAnalysisSteps()
    } else if (lowerMessage.includes('create') || lowerMessage.includes('build') || lowerMessage.includes('make')) {
      return this.createCreationSteps()
    } else {
      return this.createGenericSteps(userMessage)
    }
  }

  private static createArticleWritingSteps(userMessage: string): AgentStep[] {
    const topicMatch = userMessage.match(/about\s+([^,.\n]+)/i)
    const topic = topicMatch ? topicMatch[1].trim() : 'the specified topic'
    
    return [
      {
        stepNumber: 1,
        action: `Research and gather comprehensive information about ${topic}`,
        reasoning: `Need to collect relevant facts, statistics, and key information about ${topic} before writing`,
        result: '',
        status: 'pending' as const
      },
      {
        stepNumber: 2,
        action: `Create a detailed article outline and structure for ${topic}`,
        reasoning: `Organizing content into a logical structure will help create a coherent and well-structured article about ${topic}`,
        result: '',
        status: 'pending' as const
      },
      {
        stepNumber: 3,
        action: `Write a comprehensive article about ${topic} following the created outline`,
        reasoning: `Generate the actual article content with proper introduction, body paragraphs, and conclusion about ${topic}`,
        result: '',
        status: 'pending' as const
      },
      {
        stepNumber: 4,
        action: `Review and refine the article about ${topic} for quality and engagement`,
        reasoning: `Ensure the article about ${topic} has proper flow, clarity, accuracy, and engaging content`,
        result: '',
        status: 'pending' as const
      }
    ]
  }

  private static createResearchSteps(): AgentStep[] {
    return [
      {
        stepNumber: 1,
        action: 'Identify key research questions and components to analyze',
        reasoning: 'Need to establish clear research objectives and scope',
        result: '',
        status: 'pending' as const
      },
      {
        stepNumber: 2,
        action: 'Gather and analyze relevant information and data',
        reasoning: 'Collect comprehensive information to support the analysis',
        result: '',
        status: 'pending' as const
      },
      {
        stepNumber: 3,
        action: 'Synthesize findings and draw conclusions',
        reasoning: 'Combine research results into meaningful insights and recommendations',
        result: '',
        status: 'pending' as const
      }
    ]
  }

  private static createAnalysisSteps(): AgentStep[] {
    return [
      {
        stepNumber: 1,
        action: 'Identify key components to analyze',
        reasoning: 'Need to understand what aspects require analysis',
        result: '',
        status: 'pending' as const
      },
      {
        stepNumber: 2,
        action: 'Conduct detailed analysis',
        reasoning: 'Perform the actual analytical work',
        result: '',
        status: 'pending' as const
      },
      {
        stepNumber: 3,
        action: 'Summarize findings and conclusions',
        reasoning: 'Present the analysis results in a clear format',
        result: '',
        status: 'pending' as const
      }
    ]
  }

  private static createCreationSteps(): AgentStep[] {
    return [
      {
        stepNumber: 1,
        action: 'Plan the creation process',
        reasoning: 'Need to outline what needs to be created and how',
        result: '',
        status: 'pending' as const
      },
      {
        stepNumber: 2,
        action: 'Execute the creation task',
        reasoning: 'Implement the planned creation',
        result: '',
        status: 'pending' as const
      },
      {
        stepNumber: 3,
        action: 'Review and finalize the created content',
        reasoning: 'Ensure the creation meets requirements',
        result: '',
        status: 'pending' as const
      }
    ]
  }

  private static createGenericSteps(userMessage: string): AgentStep[] {
    return [
      {
        stepNumber: 1,
        action: `Understand and process the request: "${userMessage}"`,
        reasoning: 'Need to comprehend the specific requirements of the task',
        result: '',
        status: 'pending' as const
      },
      {
        stepNumber: 2,
        action: 'Execute the main task',
        reasoning: 'Perform the core work requested by the user',
        result: '',
        status: 'pending' as const
      },
      {
        stepNumber: 3,
        action: 'Provide comprehensive results',
        reasoning: 'Deliver the completed work to the user',
        result: '',
        status: 'pending' as const
      }
    ]
  }
}
