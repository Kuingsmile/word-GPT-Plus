export type ToolSelection<Name extends string = string> = readonly Name[] | (() => readonly Name[] | undefined)

// Only omission uses defaults. Empty, malformed, and unknown-only lists grant nothing.
export function resolveToolNames<Name extends string>(
  configured: unknown,
  knownNames: readonly Name[],
  defaults: readonly Name[],
): Name[] {
  const names = configured === undefined ? defaults : configured
  if (!Array.isArray(names)) return []
  return knownNames.filter(name => names.includes(name))
}

export function resolveToolSelection<Name extends string>(
  selection: ToolSelection<Name> | undefined,
  knownNames: readonly Name[],
  defaults: readonly Name[],
): Name[] {
  try {
    return resolveToolNames(typeof selection === 'function' ? selection() : selection, knownNames, defaults)
  } catch {
    return []
  }
}

export function readToolPreference<Name extends string>(
  key: string,
  knownNames: readonly Name[],
  defaults: readonly Name[],
): Name[] {
  try {
    const stored = localStorage.getItem(key)
    return resolveToolNames(stored === null ? undefined : JSON.parse(stored), knownNames, defaults)
  } catch {
    return []
  }
}

export function toolPermissionError(name: string): string {
  return `Tool "${name}" is not permitted by the active tool allowlist.`
}
