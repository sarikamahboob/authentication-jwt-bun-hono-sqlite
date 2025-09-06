import { describe, it, expect } from 'bun:test'
import { applySchema, dbConnect } from '../db/db'
import { Database } from 'bun:sqlite'

export const createTestDb = (): Database => {
    const db = new Database(':memory:')
    db.exec('PRAGMA journal_mode = WAL;')
    applySchema(db)
    return db
}