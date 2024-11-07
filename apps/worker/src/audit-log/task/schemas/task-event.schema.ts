import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document } from 'mongoose';

export type TaskEventDocument = HydratedDocument<TaskEvent>;

@Schema()
export class TaskEvent extends Document {
  @Prop()
  userId: number;

  @Prop()
  taskId: number;

  @Prop()
  kind: string;

  @Prop({ required: false })
  madeChanges: string;

  @Prop({ type: Date })
  date: Date;
}

export const TaskEventSchema = SchemaFactory.createForClass(TaskEvent);
