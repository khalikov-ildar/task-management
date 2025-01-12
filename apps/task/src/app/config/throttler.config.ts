import { ThrottlerModuleOptions } from '@nestjs/throttler'

export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      ttl: 60000,
      limit: 10
    }
  ],
  errorMessage: 'Too many requests, please try again later',
  ignoreUserAgents: [/health-check/i]
}
