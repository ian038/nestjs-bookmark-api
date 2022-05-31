import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service'
import { AppModule } from '../src/app.module'
import * as pactum from 'pactum'
import { AuthDto } from '../src/auth/dto'
import { EditUserDto } from '../src/user/dto'
import { CreateBookmarkDto } from '../src/bookmark/dto'

describe('App end to end', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = module.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      })
    )
    await app.init()
    await app.listen(3333)

    prisma = app.get(PrismaService)
    await prisma.cleanDb()
    pactum.request.setBaseUrl('http://localhost:3333')
  })

  afterAll(() => {
    app.close()
  })

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@test.com',
      password: '123'
    }
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum.spec().post('/auth/signup').withBody({ password: dto.password }).expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum.spec().post('/auth/signup').withBody({ email: dto.email }).expectStatus(400);
      });
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should signup', () => {
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201)
      })
    })

    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum.spec().post('/auth/signin').withBody({ password: dto.password }).expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum.spec().post('/auth/signin').withBody({ email: dto.email }).expectStatus(400);
      });
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
      it('should sign in', () => {
        return pactum.spec().post('/auth/signin').withBody(dto).expectStatus(200).stores('userAt', 'access_token');
      })
    })
  })

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum.spec().get('/users/me').withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
      })
    })

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'John',
          email: 'abc@test.com'
        }
        return pactum.spec().put('/users').withHeaders({ Authorization: 'Bearer $S{userAt}' }).withBody(dto)
          .expectStatus(200).expectBodyContains(dto.firstName).expectBodyContains(dto.email)
      })
    })
  })

  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('shoult get bookmarks', () => {
        return pactum.spec().get('/bookmarks').withHeaders({ Authorization: 'Bearer $S{userAt}' }).expectStatus(200)
      })
    })

    describe('Create bookmark', () => {
      it('should create bookmark', () => {
        const dto: CreateBookmarkDto = {
          title: 'First Bookmark',
          link: 'https://www.youtube.com/watch?v=d6WC5n9G_sM'
        }
        return pactum.spec().post('/bookmarks').withHeaders({ Authorization: 'Bearer $S{userAt}' }).withBody(dto)
          .expectStatus(201).stores('bookmarkId', 'id')
      })
    })

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum.spec().get('/bookmarks').withHeaders({ Authorization: 'Bearer $S{userAt}' }).expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum.spec().get('/bookmarks/{id}').withPathParams('id', '$S{bookmarkId}').withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200).expectBodyContains('$S{bookmarkId}')
      })
    })

    describe('Edit bookmark', () => { })

    describe('Delete bookmark', () => { })
  })
})