import { IHashingService } from '../../../task/src/auth/services/hashing/i-hashing.service'
import { UsersService } from '../../../task/src/users/users.service'
import { moderator, user } from './samples'

export async function seedUsers(
  userService: UsersService,
  hashingService: IHashingService
) {
  await userService.create({
    email: user.email,
    password: await hashingService.hash(user.password),
    name: user.name,
    emailToken: user.emailToken,
    role: user.role
  })
  await userService.updateBy({ email: user.email }, { isEmailConfirmed: true })
  await userService.create({
    email: moderator.email,
    password: await hashingService.hash(moderator.password),
    name: moderator.name,
    emailToken: moderator.emailToken,
    role: moderator.role
  })
  await userService.updateBy(
    { email: moderator.email },
    { isEmailConfirmed: true }
  )
}
