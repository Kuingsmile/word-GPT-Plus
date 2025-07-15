export { AgentWorkflowManager } from './workflow-manager'
export { AgentModeHelper } from './mode-helper'
export { TaskAnalyzer } from './task-analyzer'
export { SimpleTaskExecutor } from './simple-executor'
export { ResultSynthesizer } from './result-synthesizer'
export { FallbackStepGenerator } from './fallback-generator'
export { AgentAPIClient } from './api-client'

export type { 
  AgentChatCompletionOptions, 
  AgentStep, 
  AgentMode, 
  WorkflowExecutionContext 
} from './types'

import { AgentWorkflowManager } from './workflow-manager'
import { AgentChatCompletionOptions } from './types'

async function createChatCompletionStream(
  options: AgentChatCompletionOptions
): Promise<void> {
  const manager = new AgentWorkflowManager(options)
  await manager.executeWorkflow()
}

export default { 
  createChatCompletionStream,
  AgentWorkflowManager
}
