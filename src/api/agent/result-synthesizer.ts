import { AgentStep, AgentChatCompletionOptions } from './types'
import { AgentAPIClient } from './api-client'


export class ResultSynthesizer {
  private apiClient: AgentAPIClient
  private debugMode: boolean

  constructor(options: AgentChatCompletionOptions, debugMode = true) {
    this.apiClient = new AgentAPIClient(options, debugMode)
    this.debugMode = debugMode
  }

  private debugLog(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[Result Synthesizer] ${message}`, data || '')
    }
  }

  async synthesizeResults(steps: AgentStep[], userMessage: string): Promise<string> {
    const completedSteps = steps.filter(step => step.status === 'completed')
    this.debugLog('Synthesizing results', { completedStepsCount: completedSteps.length })
    
    if (completedSteps.length === 0) {
      this.debugLog('No completed steps found, checking for pending steps with results')
      const stepsWithResults = steps.filter(step => step.result && step.result.trim().length > 0)
      
      if (stepsWithResults.length === 0) {
        this.debugLog('No steps with results found, returning error message')
        return 'Unable to complete the requested task. The analysis steps could not be properly executed. Please try again with a more specific request.'
      }
      
      return this.synthesizeFromSteps(stepsWithResults, userMessage)
    }

    return this.synthesizeFromSteps(completedSteps, userMessage)
  }

  private async synthesizeFromSteps(steps: AgentStep[], userMessage: string): Promise<string> {
    const synthesisPrompt = [
      {
        role: 'system',
        content: `You are an intelligent content synthesizer. Your task is to create the final deliverable from completed workflow steps.

CRITICAL OUTPUT RULES:
- Provide ONLY the final content/result that the user requested
- NO process summaries, step descriptions, or explanations
- Use markdown formatting for headers, lists, bold text, italic text, and code blocks
- NO generic templates or placeholder content
- NO "Based on the steps..." or "Here is the final..." prefixes
- Just deliver the pure, clean final content ready for document insertion with proper markdown formatting

Examples:
- If the task was to write an article, provide ONLY the complete article text
- If the task was to analyze text, provide ONLY the analysis results
- If the task was to create a report, provide ONLY the report content
- If the task was to optimize text, provide ONLY the optimized version

The user wants the actual final deliverable, not a summary of what was done.

Completed workflow steps:
${steps.map(step => 
  `Step ${step.stepNumber}: ${step.action}\nResult: ${step.result}\n`
).join('\n')}`
      },
      {
        role: 'user',
        content: userMessage ? userMessage : 'Provide the final deliverable content only - no explanations, process descriptions, or generic templates.'
      }
    ]

    const result = await this.apiClient.callBaseAPI(synthesisPrompt)
    
    let cleanResult = result.trim()
    
    const prefixesToRemove = [
      /^Based on the [\s\S]*?:\s*/i,
      /^Here is the [\s\S]*?:\s*/i,
      /^The final [\s\S]*?:\s*/i,
      /^Here's the [\s\S]*?:\s*/i,
      /^Final [\s\S]*?:\s*/i,
      /^After [\s\S]*?:\s*/i,
      /^Following [\s\S]*?:\s*/i,
      /^## Final Deliverable Content:[\s\S]*?\*\*Code:\*\*[\s\S]*?$/i
    ]
    
    for (const pattern of prefixesToRemove) {
      cleanResult = cleanResult.replace(pattern, '')
    }
    
    const genericPatterns = [
      /\*\s*\*\*Code:\*\*[\s\S]*?\*\s*\*\*Reports:\*\*[\s\S]*$/i,
      /Final Deliverable Content:[\s\S]*$/i,
      /^\s*\*\s*\*\*[A-Za-z\s]+:\*\*\s*\([^)]*\)[\s\S]*$/
    ]
    
    for (const pattern of genericPatterns) {
      if (pattern.test(cleanResult)) {
        this.debugLog('Detected generic template, requesting real content')
        return this.requestActualContent(steps, userMessage)
      }
    }
    
    this.debugLog('Result synthesis completed', { result: cleanResult })
    return cleanResult
  }

  private async requestActualContent(steps: AgentStep[], userMessage: string): Promise<string> {
    const contentPrompt = [
      {
        role: 'system',
        content: `Create the actual content requested by the user. Do not provide templates, examples, or generic descriptions.

Based on these completed steps, generate the real, final content that the user needs:

${steps.map(step => 
  `Step ${step.stepNumber}: ${step.action}\nResult: ${step.result}\n`
).join('\n')}

CRITICAL: Provide the actual finished content, not a description of what should be included.`
      },
      {
        role: 'user',
        content: userMessage ? userMessage : 'Generate the actual final content - not templates or examples.'
      }
    ]

    const result = await this.apiClient.callBaseAPI(contentPrompt)
    this.debugLog('Actual content generation completed', { resultLength: result.trim().length })
    return result.trim()
  }
}
