import { AgentStep, AgentChatCompletionOptions } from './types'
import { AgentAPIClient } from './api-client'
import { AgentModeHelper } from './mode-helper'
import { FallbackStepGenerator } from './fallback-generator'

export class TaskAnalyzer {
  private apiClient: AgentAPIClient
  private options: AgentChatCompletionOptions
  private debugMode: boolean

  constructor(options: AgentChatCompletionOptions, debugMode = true) {
    this.options = options
    this.apiClient = new AgentAPIClient(options, debugMode)
    this.debugMode = debugMode
  }

  private debugLog(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[Task Analyzer] ${message}`, data || '')
    }
  }

  async analyzeTask(userMessage: string): Promise<AgentStep[]> {
    this.debugLog('Starting task analysis', { userMessage: userMessage.substring(0, 100) + '...' })
    
    const agentModeInstructions = AgentModeHelper.getAgentModeInstructions(this.options.agentMode)
    
    const analysisPrompt = this.buildAnalysisPrompt(agentModeInstructions, userMessage)

    try {
      this.debugLog('Calling base API for task analysis')
      const response = await this.apiClient.callBaseAPI(analysisPrompt)
      this.debugLog('Task analysis response received', { response: response })
      
      const steps = await this.parseAnalysisResponse(response)
      this.debugLog('Task analysis completed successfully', { stepCount: steps.length })
      return steps
      
    } catch (error) {
      this.debugLog('Failed to parse agent steps JSON, using intelligent fallback', error)
      return FallbackStepGenerator.createFallbackSteps(userMessage, this.options.agentMode)
    }
  }

  private buildAnalysisPrompt(agentModeInstructions: string, userMessage: string) {
    return [
      {
        role: 'system',
        content: `You are an intelligent agent planner for ${this.options.agentMode} mode. Your ONLY job is to return a valid JSON array - nothing else.

CRITICAL RESPONSE RULES:
- You MUST respond with ONLY a valid JSON array
- NO explanatory text before or after the JSON
- NO markdown formatting or code blocks
- NO additional fields beyond "action" and "reasoning"
- The response must start with [ and end with ]

${agentModeInstructions}

Break down the user's task into ${this.options.agentMaxSteps} or fewer actionable steps. Each step should be SPECIFIC and EXECUTABLE without requiring additional user input.

Return ONLY this EXACT JSON structure with ONLY these two fields:

[
  {
    "action": "brief description of the specific action to take",
    "reasoning": "why this step is needed"
  }
]

STRICT FORMATTING RULES:
- Use EXACTLY "action" and "reasoning" - no other field names
- Do NOT include: stepNumber, status, step_number, description, parameters, details, title, step
- Keep JSON valid and well-formed
- NO trailing commas
- NO comments in JSON
- NO extra properties or nested objects
- Each object must have exactly 2 properties: "action" and "reasoning"

Task Analysis Guidelines:
- Keep steps logical and sequential
- Each step should build upon previous steps
- Focus on actionable items that can be completed with the provided context
- Make steps specific enough to be executed without asking for more information
- For content creation tasks, include specific deliverables in each step
- Consider the complexity level: ${this.options.agentThinkingDepth}/5

Examples of GOOD action descriptions:
- "Research key facts and benefits about apples including nutritional value and varieties"
- "Create a detailed outline for an article about apples with introduction, 3 main sections, and conclusion"
- "Write a comprehensive 800-word article about apples following the created outline"
- "Review and polish the article for clarity, flow, and engagement"

Examples of BAD action descriptions (too vague):
- "Research the topic" 
- "Create an outline"
- "Write content"
- "Review the work"

REMEMBER: Return ONLY the JSON array. No other text whatsoever.`
      },
      {
        role: 'user',
        content: `Break down this task into specific, executable JSON steps: ${userMessage}

Respond with ONLY the JSON array - no explanations, no markdown, no other text.`
      }
    ]
  }

  private async parseAnalysisResponse(response: string): Promise<AgentStep[]> {
    let cleanResponse = response.trim()
    
    cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '')
    
    const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      cleanResponse = jsonMatch[0]
    }
    
    cleanResponse = cleanResponse
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
    
    this.debugLog('Attempting to parse cleaned response', { 
      cleanResponse: cleanResponse.substring(0, 200) + '...',
      fullResponse: cleanResponse.length < 500 ? cleanResponse : cleanResponse.substring(0, 500) + '...'
    })
    
    let steps
    try {
      steps = JSON.parse(cleanResponse)
    } catch (parseError: any) {
      this.debugLog('Initial JSON parse failed, attempting advanced fix', { 
        error: parseError?.message || 'Unknown parse error',
        position: parseError?.message?.match(/position (\d+)/)?.[1]
      })
      
      steps = this.attemptJSONRepair(cleanResponse, parseError)
    }
    
    if (!Array.isArray(steps)) {
      throw new Error('Response is not an array')
    }
    
    const formattedSteps = steps.map((step: any, index: number) => ({
      stepNumber: index + 1,
      action: step.action || step.title || step.description || step.step || `Step ${index + 1}`,
      reasoning: step.reasoning || step.description || step.reason || step.rationale || step.details || 'No reasoning provided',
      result: '',
      status: 'pending' as const
    }))
    
    return formattedSteps
  }

  private attemptJSONRepair(jsonString: string, originalError: any): any {
    let fixedJson = jsonString
    
    const truncatePatterns = [
      /,\s*\n\s*$/,
      /\n\s*"[^"]*":\s*$/,
      /\n\s*\{[^}]*$/,
      /\n\s*"[^"]*":\s*"[^"]*$/,
      /\n\s*"[^"]*":\s*\[[^\]]*$/,
    ]
    
    for (const pattern of truncatePatterns) {
      const match = fixedJson.match(pattern)
      if (match) {
        fixedJson = fixedJson.substring(0, match.index) + '\n]'
        this.debugLog('Attempting JSON repair by truncating', { 
          pattern: pattern.toString(),
          fixedLength: fixedJson.length 
        })
        
        try {
          const result = JSON.parse(fixedJson)
          this.debugLog('JSON repair successful via truncation')
          return result
        } catch {
          // ignore
        }
      }
    }
    
    try {
      const objectMatches = jsonString.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g)
      if (objectMatches && objectMatches.length > 0) {
        const extractedSteps = []
        
        for (const objStr of objectMatches) {
          try {
            const obj = JSON.parse(objStr)
            if (obj.action || obj.title || obj.description || obj.step) {
              extractedSteps.push(obj)
            }
          } catch {
            // ignore
          }
        }
        
        if (extractedSteps.length > 0) {
          this.debugLog('JSON repair successful via object extraction', { 
            extractedCount: extractedSteps.length 
          })
          return extractedSteps
        }
      }
    } catch {
      // ignore
    }
    
    try {
      let repairedJson = jsonString
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/([^"]\w+):/g, '"$1":')
        .replace(/:\s*([^",[\]{}]+)(?=\s*[,\]}])/g, ': "$1"')
        .replace(/,(\s*[\]}])/g, '$1')

      const result = JSON.parse(repairedJson)
      this.debugLog('JSON repair successful via syntax fixing')
      return result
    } catch {
      // ignore
    }
    
    this.debugLog('All JSON repair strategies failed')
    throw originalError
  }
}
