import { Test, TestingModule } from '@nestjs/testing'
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../src/app/app.module'
import { RegisterUserDto } from 'apps/task/src/auth/dtos/register-user.dto'
import { RegisterUserResponseDto } from 'apps/task/src/auth/dtos/register-user.response.dto'
import { LoginUserDto } from '../../src/auth/dtos/login-user.dto'
import { UsersService } from '../../src/users/users.service'
import { Roles } from '../../src/users/enums/roles.enum'

describe('[AuthController] E2E', () => {
  let app: INestApplication
  let userService: UsersService

  const user: RegisterUserDto = {
    email: 'email@email.com',
    password: 'password123',
    name: 'Nick'
  }

  const userLogin: LoginUserDto = {
    email: user.email,
    password: user.password
  }

  const invalidUserLogin: LoginUserDto = {
    email: 'invalid@email.com',
    password: 'invalidPassword'
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule.setEnvironment('test')]
    }).compile()

    app = moduleFixture.createNestApplication()
    userService = moduleFixture.get<UsersService>(UsersService)
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    app.enableShutdownHooks()
    await app.init()
  })

  afterAll(async () => {
    await userService.deleteAll()
    await app.close()
  })

  describe('/auth/register [POST]', () => {
    it('Should successfuly register a new user', () => {
      const response: RegisterUserResponseDto = {
        email: user.email,
        name: user.name,
        isEmailConfirmed: false
      }
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(user)
        .expect(HttpStatus.CREATED, response)
    })

    it('Should fail if the user already exists', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(user)
        .expect(HttpStatus.CONFLICT)
    })
  })

  describe('/auth/login [POST]', () => {
    it('Should fail if the user is not confirmed', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(userLogin)
        .expect(HttpStatus.FORBIDDEN)
    })

    it('Should fail if the email is wrong', async () => {
      await userService.updateBy(
        { email: user.email },
        { isEmailConfirmed: true }
      )
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidUserLogin)
        .expect(HttpStatus.UNAUTHORIZED)
    })

    it('Should fail if the password is wrong', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...userLogin, password: 'wrongPassword' })
        .expect(HttpStatus.UNAUTHORIZED)
    })

    it('Should successfuly login a user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userLogin)
      expect(res.status).toBe(HttpStatus.OK)
      const cookies = res.headers['set-cookie']
      expect(cookies).toBeDefined()
      expect(res.body.accessToken).toBeDefined()
    })
  })

  describe('/auth/refresh [POST]', () => {
    let cookies: string

    it('Should fail if there is no refresh token in the cookies', () => {
      request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(HttpStatus.NO_CONTENT)
    })

    it('Should successfuly refresh the access token', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userLogin)
      cookies = loginResponse.headers['set-cookie']
      request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', cookies)
        .expect(HttpStatus.OK)
    })

    it('Should fail if the refresh token is found being reused', () => {
      request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', cookies)
        .expect(HttpStatus.FORBIDDEN)
    })
  })
})
