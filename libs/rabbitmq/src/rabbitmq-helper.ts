export function buildRmqConnectionString(
  user: string,
  password: string,
  host: string,
) {
  return `amqp://${user}:${password}@${host}`;
}
