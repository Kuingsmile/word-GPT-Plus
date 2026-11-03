import { createGeneralTools, loadEnabledGeneralTools } from './generalTools'
import { createWordTools, loadEnabledWordTools } from './wordTools'

export function loadActiveToolNames(): string[] {
  return [...loadEnabledGeneralTools(), ...loadEnabledWordTools()]
}

export function getActiveTools() {
  // Read storage for every invocation, including after settings navigation or checkpoint replay.
  return [...createGeneralTools(loadEnabledGeneralTools), ...createWordTools(loadEnabledWordTools)]
}
