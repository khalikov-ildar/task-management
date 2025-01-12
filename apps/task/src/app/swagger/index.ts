import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { REFRESH_COOKIE_TOKEN } from '../../auth/auth.constants'
import { INestApplication } from '@nestjs/common'

export function initSwagger(app: INestApplication, path: string) {
  const config = new DocumentBuilder()
    .setTitle('Task Management App')
    .setDescription('The Task Management Application API')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth(REFRESH_COOKIE_TOKEN)
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)
}
