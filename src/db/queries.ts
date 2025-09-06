import { Database } from "bun:sqlite";
import { type UUID, randomUUID } from "crypto";

export const insertUser = async (db: Database, email: string, password: string) => {
    const userId = crypto.randomUUID()
    const passwordHash = await Bun.password.hash(password)

    const insertQuery = db.query(
        `
        INSERT INTO users (id, email, password) 
        VALUES (?, ?, ?)
        RETURNING id
        `
    )

    const result = insertQuery.get(userId, email, passwordHash) as { id: UUID }

    return result.id
}

export const getUserByEmail = async (db: Database, email: string) => {
    const userQuery = db.query(
        `SELECT id, password FROM users WHERE email = ?`
    )
    const result = userQuery.get(email) as { id: UUID, password: string } | null
    return result
}

export const getUserById = async (db: Database, id: UUID) => {
    const userQuery = db.query(
        `SELECT id, email FROM users WHERE id = ?`
    )
    const result = userQuery.get(id) as { id: UUID, email: string } | null
    return result
}