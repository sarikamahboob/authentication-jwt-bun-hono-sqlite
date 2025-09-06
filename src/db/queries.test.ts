import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { dbConnect } from './db'
import { getUserByEmail, insertUser } from './queries'
import { createTestDb } from '../test/test-db'
import { Database } from 'bun:sqlite'

let db: Database;

beforeEach(() => {
    db = createTestDb()
})

afterEach(() => {
    db.close()
})

describe('insertUser', () => {
    it('should insert a user into the database', async () => {        
        const userId = await insertUser(db, 'test@test1.com', 'password123')
        expect(userId).toBeDefined()
    })

    it('should throw an error if the email is already in the database', async () => {
        const email = "test@test1.com"
        await insertUser(db, email, 'password123')
        try {
            await insertUser(db, email, 'password123')
        } catch (error:any) {
            expect(error).toBeInstanceOf(Error)
            expect(error.message).toContain('UNIQUE constraint failed: users.email')
        }
    })

    it('should throw an error if the password is empty', async () => {
        const email = "test@test1.com"
        const password = ""
        try {
            await insertUser(db, email, password)
        } catch (error:any) {
            expect(error).toBeInstanceOf(Error)
            expect(error.message).toContain('password must not be empty')
        }
    })
})

describe('getUserByEmail', () => {
    it('should return a user by a given email', async () => {
        const email = "test@test1.com"
        const password = "password123"
        await insertUser(db, email, password)
        const user = await getUserByEmail(db, email)
        expect(user).toBeDefined()
    })
    it('should return null when there is no user with the given email', async () => {
        const email = "test@test1.com"
        const user = await getUserByEmail(db, email)
        expect(user).toBeNull()
    })
})