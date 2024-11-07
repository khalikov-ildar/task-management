export const TASK_UPDATED_EVENT = { cmd: 'task_updated' };

export type TaskUpdatedEventPayload = {
  userId: number;
  taskId: number;
  changedTo: any;
};
