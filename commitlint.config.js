import { fileURLToPath } from 'node:url'

export default {
  extends: [fileURLToPath(import.meta.resolve('node-bump-version/commitlint'))],
}
