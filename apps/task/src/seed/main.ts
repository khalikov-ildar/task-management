import { NestFactory } from '@nestjs/core'
import { SeedingModule } from './seeding.module'
import { Logger } from '@nestjs/common'
import { SeedingService } from './seeding.service'

async function bootstrap() {
  const app = await NestFactory.create(SeedingModule)
  const seedingService = app.get(SeedingService)

  app.enableShutdownHooks()

  const before = performance.now()

  await seedingService.seedApplication()

  Logger.log('Seeding finished in ' + (performance.now() - before) + 'ms')

  app.close()
}

bootstrap()
