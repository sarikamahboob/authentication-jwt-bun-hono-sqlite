import { Hono } from 'hono'
import { dbConnect } from './db/db'
import { getUserByEmail, getUserById, insertUser } from './db/queries'
import { signupValidator } from './schemas/signup-schema'
import { cookieOpts, generateJWT } from './helper'
import { deleteCookie, setCookie } from 'hono/cookie'
import { csrf } from 'hono/csrf'
import { jwt } from 'hono/jwt'

const app = new Hono()

app
  .use("/api/v1/*", csrf())
  .use("/api/v1/auth/me", jwt({secret: process.env.JWT_SECRET!, cookie: 'authToken'}))
  .post('/api/v1/auth/register', signupValidator, async (c) => {
    const db = dbConnect()
    // validate the users input
    const { email, password } = c.req.valid('json')
    // insert the user into the database
    try {
      const userId = await insertUser(db, email, password)
      // generate a JWT token
      const token = await generateJWT(userId)
      // put that JWT into a cookie 
      setCookie(c, 'authToken', token, cookieOpts)
      // send success response
      return c.json({
        success: true,
        message: "User registered successfully",
        user: { id: userId, email: email },
      }, 200)
      // send an error message
    } catch (error) {
      if(error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        return c.json({errors: ['Email already exists']}, 409)
      }
      console.error('Signup error', error)
      return c.json({errors: ['Internal server error']}, 500)
    }
  })
  .post('/api/v1/auth/login', signupValidator, async (c) => {
    const db = dbConnect()
    // validate user input
    const { email, password } = c.req.valid('json')
    try {
      // query user by email
      const user = await getUserByEmail(db, email)
      if(!user) {
        return c.json({errors: ['Invalid credentials']}, 401)
      }
      // verify password matches
      const passwordMatch = await Bun.password.verify(password, user.password)
      // if doesn't match then rreturn 401
      if(!passwordMatch) {
        return c.json({errors: ['Invalid credentials']}, 401)
      }
      // if matches then generate a JWT token
      const token = await generateJWT(user.id)
      // put JWT in a cookie
      setCookie(c, 'authToken', token, cookieOpts)
      // send success response
      return c.json({message: 'Login successful', user: {id: user.id, email: email}}, 200)
      // send error response
    } catch (error) {
      console.error('Login error', error)
      return c.json({errors: ['Internal server error']}, 500)
    }
  })
  .post('/api/v1/auth/logout', async (c) => {
    deleteCookie(c, 'authToken', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    })
    return c.json({message: 'Logout successful'}, 200)
  })
  .get('/api/v1/auth/me', async (c) => {
    const db = dbConnect()
    const payload = c.get('jwtPayload')
    try {
      // fetch user by id
      const user = await getUserById(db, payload.sub)
      if(!user) {
        return c.json({errors: ['User not found']}, 404)
      }
      return c.json({
        id: user.id,
        email: user.email
      }, 200)
    } catch (error) {
      console.error('Error fetching user data', error)
      return c.json({errors: ['Internal server error']}, 500)
    }
  })

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
