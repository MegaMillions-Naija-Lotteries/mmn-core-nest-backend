import { Test } from "@nestjs/testing"
import * as pactum from 'pactum';
import { AppModule } from "../src/app.module"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import { AuthDto } from "src/auth/dto";
import { EditUserDto } from "src/user/dto";

describe('App e2e', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      })
    );
    await app.init();
    await app.listen(3333);
    pactum.request.setBaseUrl('http://localhost:3333')
  })
  afterAll(()=>{
    app.close();
  });
  describe('Auth', ()=> {
    const dto:AuthDto = {
      email: `user${Math.floor(Math.random() * 100000)}@gmail.com`,
      password: Math.random().toString(36).slice(-8)
    }
    describe('Signup', ()=>{
      it('should throw if email empty', () => {
        return pactum.spec().post('/auth/signup')
          .withBody({
            password:dto.password
          })
          .expectStatus(400)
          // .inspect();
      });
      it('should throw if password empty', () => {
        return pactum.spec().post('/auth/signup')
          .withBody({
            email:dto.email
          })
          .expectStatus(400)
          // .inspect();
      })
      it('should throw if no body is provided ', () => {
        return pactum.spec().post('/auth/signup')
          .expectStatus(400)
          // .inspect();
      })
      it('should signup', ()=>{
        return pactum.spec().post('/auth/signup')
        .withBody(dto)
        .expectStatus(201)
        // .inspect();
      });
    });
    describe('Signin', ()=>{
      it('should throw if email empty', () => {
        return pactum.spec().post('/auth/login')
          .withBody({
            password:dto.password
          })
          .expectStatus(400)
          // .inspect();
      });
      it('should throw if password empty', () => {
        return pactum.spec().post('/auth/login')
          .withBody({
            email:dto.email
          })
          .expectStatus(400)
          // .inspect();
      })
      it('should throw if no body is provided ', () => {
        return pactum.spec().post('/auth/login')
          .expectStatus(400)
          // .inspect();
      })
      it('should signin', () => {
        return pactum.spec().post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token')
          // .inspect();
      });

    });
  });
  describe('User', ()=>{
    describe('Get me', ()=>{
      it('should get current user', () => {
        return pactum.spec()
          .get('/users/me')
          .withBearerToken('$S{userAt}')
          .expectStatus(200);
          // .inspect();
      });
    })
    describe('Edit user', ()=>{
      it('should edit user', () => {
        const dto:EditUserDto = {
          name: 'Vald',
          email:'dage@eee.cd'
        }
        return pactum.spec()
          .patch('/users')
          .withBearerToken('$S{userAt}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.name)
          .expectBodyContains(dto.email);
          // .inspect();
      });
    })
  })
})