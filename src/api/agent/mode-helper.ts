/**
 * Agent mode specific instructions and configurations
 */

export class AgentModeHelper {
  /**
   * Get agent mode specific instructions for task planning
   */
  static getAgentModeInstructions(agentMode: string): string {
    switch (agentMode) {
      case 'auto-workflow':
        return `As an auto-workflow agent, focus on creating efficient, automated task sequences. Break complex tasks into clear, logical steps that build upon each other.`
      
      case 'multi-step':
        return `As a multi-step agent, excel at breaking down complex tasks into manageable sequential steps. Each step should have a clear purpose and contribute to the final goal.`
      
      case 'research-assistant':
        return `As a research assistant, prioritize information gathering, analysis, and synthesis. Focus on steps that involve research, fact-checking, and organizing information logically.`
      
      case 'writing-coach':
        return `As a writing coach, focus on the writing process: planning, drafting, revising, and polishing. Emphasize clarity, structure, and engagement in written content.`
      
      case 'document-analyzer':
        return `As a document analyzer, focus on understanding, analyzing, and improving existing content. Prioritize steps that involve content review, optimization, and enhancement.`
      
      default:
        return `As a general-purpose agent, adapt your approach based on the task requirements. Focus on logical, efficient step sequences.`
    }
  }


  static isSimpleTask(agentMode: string, userMessage: string): boolean {
    const lowerMessage = userMessage.toLowerCase()
    
    if (agentMode === 'document-analyzer' || agentMode === 'writing-coach') {
      const simpleTaskKeywords = [
        'fix', 'correct', 'polish', 'optimize', 'improve', 'edit', 
        'proofread', 'grammar', 'typo', 'spelling', 'rewrite', 
        'rephrase', 'translate', 'summarize'
      ]
      
      const hasSimpleKeyword = simpleTaskKeywords.some(keyword => 
        lowerMessage.includes(keyword)
      )
      
      if (hasSimpleKeyword && userMessage.length < 1000) {
        return true
      }
    }
    
    return false
  }

  static getSimpleTaskOptimization(agentMode: string): {
    systemPrompt: string
    prefixesToRemove: RegExp[]
  } {
    const baseSystemPrompt = `You are a professional writing assistant. Provide direct, clean output suitable for insertion into a document.

IMPORTANT OUTPUT RULES:
- Provide ONLY the final result/content
- NO explanations, process descriptions, or metadata
- NO markdown formatting or technical markup
- NO "Here is..." or "The result is..." prefixes
- Just the pure, clean content ready for document insertion

For example:
- If asked to fix typos, provide only the corrected text
- If asked to optimize writing, provide only the optimized version
- If asked to translate, provide only the translation
- If asked to summarize, provide only the summary

Focus on delivering exactly what the user needs for their document.`

    const basePrefixes = [
      /^Here is the [^:]*:\s*/i,
      /^The [^:]*:\s*/i,
      /^Here's the [^:]*:\s*/i,
      /^Result:\s*/i,
      /^Output:\s*/i,
      /^Final version:\s*/i,
      /^Optimized version:\s*/i,
      /^Corrected version:\s*/i,
      /^Improved version:\s*/i
    ]

    switch (agentMode) {
      case 'writing-coach':
        return {
          systemPrompt: baseSystemPrompt + `\n\nAs a writing coach, focus on improving clarity, flow, and engagement while maintaining the original voice and intent.`,
          prefixesToRemove: [
            ...basePrefixes,
            /^Revised text:\s*/i,
            /^Enhanced version:\s*/i,
            /^Polished version:\s*/i
          ]
        }
      
      case 'document-analyzer':
        return {
          systemPrompt: baseSystemPrompt + `\n\nAs a document analyzer, focus on precision and accuracy in your corrections and improvements.`,
          prefixesToRemove: [
            ...basePrefixes,
            /^Analyzed text:\s*/i,
            /^Reviewed version:\s*/i,
            /^Processed text:\s*/i
          ]
        }
      
      default:
        return {
          systemPrompt: baseSystemPrompt,
          prefixesToRemove: basePrefixes
        }
    }
  }
}
