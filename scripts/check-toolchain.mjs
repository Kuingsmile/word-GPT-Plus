import { readFileSync } from 'node:fs'

const { engines, packageManager } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const agent = process.env.npm_config_user_agent ?? ''

if (process.versions.node !== engines.node || !agent.startsWith(`pnpm/${engines.pnpm} `)) {
  console.error(`Use Node.js ${engines.node} and ${packageManager}. See README.md for setup instructions.`)
  process.exit(1)
}
