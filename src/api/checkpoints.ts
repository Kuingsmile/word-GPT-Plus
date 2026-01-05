import type { RunnableConfig } from '@langchain/core/runnables'
import { BaseCheckpointSaver, Checkpoint, CheckpointMetadata, CheckpointTuple } from '@langchain/langgraph'
import Dexie, { Table } from 'dexie'

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
  checkpoint: any
  metadata: any
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
    if (!config.configurable || !config.configurable.thread_id) {
      throw new Error('thread_id must be provided in config.configurable')
    }
    const { thread_id, checkpoint_id } = config.configurable

    let row: CheckpointRow | undefined
    if (checkpoint_id) {
      row = await db.checkpoints.get([thread_id, checkpoint_id])
    } else {
      const rows = await db.checkpoints.where('thread_id').equals(thread_id).reverse().limit(1).toArray()
      row = rows[0]
    }

    if (!row) return undefined
    const checkpoint = row.checkpoint as Checkpoint
    const metadata = row.metadata as CheckpointMetadata
    return {
      config: { configurable: { thread_id, checkpoint_id: row.checkpoint_id } },
      checkpoint,
      metadata,
      parentConfig: row.parent_checkpoint_id
        ? { configurable: { thread_id, checkpoint_id: row.parent_checkpoint_id } }
        : undefined,
    }
  }

  async *list(config: RunnableConfig, options?: CheckpointListOptions): AsyncGenerator<CheckpointTuple> {
    if (!config.configurable || !config.configurable.thread_id) {
      return
    }
    const { thread_id } = config.configurable
    let query = db.checkpoints.where({ thread_id }).reverse()

    const before_id = options?.before?.configurable?.checkpoint_id
    if (before_id) {
      query = query.filter(row => row.checkpoint_id < before_id)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const rows = await query.toArray()

    for (const row of rows) {
      yield {
        config: { configurable: { thread_id: row.thread_id, checkpoint_id: row.checkpoint_id } },
        checkpoint: row.checkpoint,
        metadata: row.metadata,
        parentConfig: row.parent_checkpoint_id
          ? { configurable: { thread_id: row.thread_id, checkpoint_id: row.parent_checkpoint_id } }
          : undefined,
      }
    }
  }

  async put(config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata): Promise<RunnableConfig> {
    if (!config.configurable || !config.configurable.thread_id || !config.configurable.checkpoint_id) {
      throw new Error('thread_id and checkpoint_id must be provided in config.configurable')
    }
    const { thread_id, checkpoint_id } = config.configurable

    await db.checkpoints.put({
      thread_id,
      checkpoint_id,
      parent_checkpoint_id: Object.values(metadata.parents ?? {})[0],
      checkpoint,
      metadata,
    })

    return config
  }

  async putWrites(config: RunnableConfig, writes: [string, any][], taskId: string): Promise<void> {
    if (!config.configurable) {
      throw new Error('configurable must be provided')
    }
    const checkpointConfig = { configurable: { ...config.configurable, checkpoint_id: taskId } }
    const current = await this.getTuple(config)

    // Deep copy channel values
    const channel_values = JSON.parse(JSON.stringify(current?.checkpoint.channel_values ?? {}))
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
