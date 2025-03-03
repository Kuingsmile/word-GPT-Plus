import { Ref } from 'vue'
import { CompletionResponse } from './types'

export function updateResult(
  response: CompletionResponse,
  result: Ref<string>,
  historyDialog: Ref<any[]>
): void {
  result.value = response.content

  historyDialog.value.push({
    role: response.role || 'assistant',
    content: response.content
  })
}

export function handleError(
  error: Error,
  result: Ref<string>,
  errorIssue: Ref<boolean>
): void {
  result.value = String(error)
  errorIssue.value = true
  console.error(error)
}

export function finishLoading(loading: Ref<boolean>): void {
  loading.value = false
}
