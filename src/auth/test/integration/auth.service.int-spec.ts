import { Test } from "@nestjs/testing"
import { AuthService } from "../../auth.service"
import { AppModule } from "../../../app.module"
import { PrismaService } from "../../../prisma/prisma.service"
import { AuthDto } from "../../dto"

describe('AuthService', () => {
    let prisma: PrismaService
    let auth: AuthService
    let access_token: string
    const dto: AuthDto = {
        email: 'test@test.com',
        password: '123'
    }
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile()

        prisma = moduleRef.get(PrismaService)
        auth = moduleRef.get(AuthService)
        await prisma.cleanDb()
    })

    describe('signup()', () => {
        it('should create user and signup', async () => {
            const user = await auth.signup(dto)
            access_token = user.access_token
        })
    })

    describe('signin()', () => {
        it('should sign in user', async () => {
            const a_token = await auth.signin(dto)
            expect(access_token).toBe(a_token.access_token)
        })
    })
    it.todo('should pass')
})