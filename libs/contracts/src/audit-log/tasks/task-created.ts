export const TASK_CREATED_EVENT = { cmd: 'task_created' };

export type TaskCreatedEventPayload = { userId: number; taskId: number };
