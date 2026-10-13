import type { RunnableConfig } from '@langchain/core/runnables'
import type { Checkpoint, CheckpointMetadata } from '@langchain/langgraph'
import { BaseCheckpointSaver, type CheckpointTuple } from '@langchain/langgraph'
export type { CheckpointTuple }
import type { Table } from 'dexie'
import Dexie from 'dexie'

import { logDiagnostic } from '@/utils/diagnostics'

export interface Thread {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export interface Node {
  id: string
  threadId: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}
interface CheckpointRow {
  thread_id: string
  checkpoint_id: string
  parent_checkpoint_id?: string
  checkpoint: Checkpoint
  metadata: CheckpointMetadata
}

export interface CheckpointListOptions {
  limit?: number
  before?: RunnableConfig
}

class LangGraphDB extends Dexie {
  checkpoints!: Table<CheckpointRow, [string, string]>
  threads!: Table<Thread, string>
  nodes!: Table<Node, string>

  constructor() {
    super('LangGraphDB')
    this.version(2)
      .stores({
        checkpoints: '[thread_id+checkpoint_id], thread_id',
        threads: 'id, title, createdAt, updatedAt',
        nodes: 'id, threadId, timestamp',
      })
      .upgrade(_tx => {
        // Migration logic can be added here if needed in the future
      })
  }
}
const db = new LangGraphDB()

export class IndexedDBSaver extends BaseCheckpointSaver {
  constructor() {
    super()
  }

  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    try {
      if (!config.configurable?.thread_id) {
        logDiagnostic('warn', '[IndexedDBSaver] getTuple: missing thread_id')
        return undefined // ✅ 返回 undefined 而不是抛错
      }

      const { thread_id, checkpoint_id } = config.configurable

      let row: CheckpointRow | undefined

      if (checkpoint_id) {
        row = await db.checkpoints.get([thread_id, checkpoint_id])
      } else {
        // When checkpoint_id is not provided, get the latest one by step
        const rows = await db.checkpoints.where('thread_id').equals(thread_id).toArray()
        if (rows.length > 0) {
          // Sort by step in descending order to find the most recent
          rows.sort((a, b) => (b.metadata?.step ?? 0) - (a.metadata?.step ?? 0))
          row = rows[0]
        }
      }

      if (!row) {
        logDiagnostic('log', '[IndexedDBSaver] getTuple: no checkpoint found', { threadId: thread_id })
        return undefined
      }

      //直接使用对象，不需要序列化
      const checkpoint = row.checkpoint
      const metadata = row.metadata

      return {
        config: { configurable: { thread_id, checkpoint_id: row.checkpoint_id } },
        checkpoint,
        metadata,
        parentConfig: row.parent_checkpoint_id
          ? { configurable: { thread_id, checkpoint_id: row.parent_checkpoint_id } }
          : undefined,
      }
    } catch (error) {
      logDiagnostic('error', '[IndexedDBSaver] getTuple error', { error, threadId: config.configurable?.thread_id })
      return undefined
    }
  }

  async *list(config: RunnableConfig, options?: CheckpointListOptions): AsyncGenerator<CheckpointTuple> {
    const thread_id = config.configurable?.thread_id
    let query
    if (thread_id) {
      query = db.checkpoints.where({ thread_id }).reverse()
    } else {
      query = db.checkpoints.toCollection().reverse()
    }

    const before_id = options?.before?.configurable?.checkpoint_id
    if (before_id) {
      query = query.filter(row => row.checkpoint_id < before_id)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const rows = await query.toArray()

    for (const row of rows) {
      const checkpoint = row.checkpoint
      const metadata = row.metadata
      yield {
        config: { configurable: { thread_id: row.thread_id, checkpoint_id: row.checkpoint_id } },
        checkpoint,
        metadata,
        parentConfig: row.parent_checkpoint_id
          ? { configurable: { thread_id: row.thread_id, checkpoint_id: row.parent_checkpoint_id } }
          : undefined,
      }
    }
  }

  async put(config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata): Promise<RunnableConfig> {
    try {
      const { thread_id } = config.configurable || {}
      if (!thread_id) {
        throw new Error('thread_id is required in config.configurable')
      }

      const checkpoint_id = config.configurable?.checkpoint_id || checkpoint.id || crypto.randomUUID()

      logDiagnostic('log', '[IndexedDBSaver] put', { threadId: thread_id, checkpointId: checkpoint_id })

      await db.checkpoints.put({
        thread_id,
        checkpoint_id,
        parent_checkpoint_id: Object.keys(metadata.parents ?? {})[0],
        checkpoint,
        metadata,
      })

      return {
        configurable: {
          thread_id,
          checkpoint_id,
        },
      }
    } catch (error) {
      logDiagnostic('error', '[IndexedDBSaver] put error', { error, threadId: config.configurable?.thread_id })
      throw error
    }
  }

  async putWrites(config: RunnableConfig, writes: [string, unknown][], taskId: string): Promise<void> {
    try {
      if (!config.configurable?.thread_id) {
        throw new Error('thread_id is required in config.configurable')
      }

      const checkpointConfig = {
        configurable: {
          ...config.configurable,
          checkpoint_id: taskId,
        },
      }

      const current = await this.getTuple(config)

      const channel_values = current?.checkpoint.channel_values
        ? structuredClone(current.checkpoint.channel_values)
        : {}

      // Apply writes to channel values
      for (const [key, value] of writes) {
        if (channel_values[key] && Array.isArray(channel_values[key]) && Array.isArray(value)) {
          channel_values[key] = channel_values[key].concat(value)
        } else {
          channel_values[key] = value
        }
      }

      const newCheckpoint: Checkpoint = {
        v: 1,
        ts: new Date().toISOString(),
        id: taskId,
        channel_values,
        channel_versions: current?.checkpoint.channel_versions ?? {},
        versions_seen: current?.checkpoint.versions_seen ?? {},
      }

      const newMetadata: CheckpointMetadata = {
        source: 'update',
        step: (current?.metadata?.step ?? -1) + 1,
        parents: current?.checkpoint.id ? { [current.checkpoint.id]: '1' } : {},
      }

      await this.put(checkpointConfig, newCheckpoint, newMetadata)
    } catch (error) {
      logDiagnostic('error', '[IndexedDBSaver] putWrites error', { error, threadId: config.configurable?.thread_id })
      throw error
    }
  }

  async deleteCheckpoint(threadId: string, checkpointId: string): Promise<void> {
    if (!threadId || !checkpointId) {
      return
    }
    await db.checkpoints.delete([threadId, checkpointId])
  }

  async deleteThread(threadId: string): Promise<void> {
    if (!threadId) {
      return
    }
    await db.transaction('rw', db.checkpoints, db.nodes, db.threads, async () => {
      await db.checkpoints.where('thread_id').equals(threadId).delete()
      await db.nodes.where('threadId').equals(threadId).delete()
      await db.threads.delete(threadId)
    })
  }
}
