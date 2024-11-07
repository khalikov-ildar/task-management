export const TASK_DELETED_EVENT = { cmd: 'task_deleted' };

export type TaskDeletedEventPayload = { userId: number; taskId: number };
