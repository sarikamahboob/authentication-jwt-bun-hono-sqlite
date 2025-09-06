import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import App from '.';
import { createTestDb } from './test/test-db';
import { Database } from 'bun:sqlite';
import { loginReq, logoutReq, signupReq } from './test/test-helpers';

let db: Database;

mock.module('../src/db/db.ts', () => {
  return {
    dbConnect: () => db,
  };
});

beforeEach(() => {
    db = createTestDb();
  });
  
afterEach(() => {
    db.close();
});

describe('singup endpoint', () => {
  it('should signup a user', async () => {
    const req = signupReq()
    const res = await App.fetch(req);
    const json = await res.json();
    expect(res.status).toEqual(200);
    expect(json).toEqual({
      success: true,
      message: 'User registered successfully',
      user: { id: expect.any(String), email: 'test@test.com' },
    });
    const cookies = res.headers.get('set-cookie');
    expect(cookies).toMatch(/authToken=/);
  });
  it('should return 409 if email already exits', async () => {
    const req = signupReq()
    const res = await App.fetch(req);
    expect(res.status).toEqual(200);

    const req2 =  signupReq()
    const res2 = await App.fetch(req2);
    const json = await res2.json();
    expect(res2.status).toEqual(409);
    expect(json).toEqual({
      errors: ['Email already exists'],
    });
  });
  it('should return error if missing email or password', async () => {
    const req = signupReq('', '')
    const res = await App.fetch(req);
    const json = await res.json();
    expect(res.status).toEqual(400);
    expect(json).toEqual({
        errors: [ "Invalid email address", "Password must be at least 8 characters long" ]
    });
  });
});

describe('login endpoint', () => {
  it('should login a user', async () => {
    // signup a user
    const req = signupReq()
    const res = await App.fetch(req);

    // login a user
    const req2 = loginReq()
    const res2 = await App.fetch(req2);
    const json = await res2.json();
    expect(res2.status).toEqual(200);
    expect(json).toEqual({
      message: 'Login successful',
      user: { id: expect.any(String), email: 'test@test.com' },
    });
    const cookies = res2.headers.get('set-cookie');
    expect(cookies).toMatch(/authToken=/);
  });

  it('should return 400 if email or password is missing', async () => {
    const req = loginReq('', '')
    const res = await App.fetch(req);
    const json = await res.json();
    expect(res.status).toEqual(400);
    expect(json).toEqual({
      errors: ['Invalid email address', 'Password must be at least 8 characters long'],
    });
  });

  it('should return 401 if incorrect password provided', async () => {
    // signup a user
    const req = signupReq()
    const res = await App.fetch(req);

    // login a user with incorrect password
    const req2 = loginReq('test@test.com', 'wrongpassword')
    const res2 = await App.fetch(req2);
    const json = await res2.json();
    expect(res2.status).toEqual(401);
    expect(json).toEqual({
      errors: ['Invalid credentials'],
    });
  });
});

describe('logout endpoint', () => {
  it('should logout a user', async () => {
    const req = logoutReq()
    const res = await App.fetch(req);
    const json = await res.json();
    expect(res.status).toEqual(200);
    expect(json).toEqual({
      message: 'Logout successful',
    });
    const cookies = res.headers.get('set-cookie');
    expect(cookies).toMatch(/authToken=;/);
  });
});