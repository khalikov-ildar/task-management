export function buildRmqConnectionString(
  user: string,
  password: string,
  port: string
) {
  return `amqp://${user}:${password}@${port}`
}
