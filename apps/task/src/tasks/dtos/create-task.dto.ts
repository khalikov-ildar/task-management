import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { Priority } from '../enums/task-priority.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTaskDto {
  @ApiProperty({ example: 'Finish the login page' })
  @IsString()
  title: string

  @ApiProperty({ example: 'Some description about the given task' })
  @IsString()
  description: string

  @ApiProperty({ example: new Date(Date.now() + 60 * 60 * 1000) })
  @IsDate()
  @Type(() => Date)
  deadline: Date

  @ApiPropertyOptional({ isArray: true, example: [1, 5, 6, 8] })
  @IsOptional()
  @IsNumber({}, { each: true })
  allowedToEditUsers?: number[]

  @ApiProperty({ isArray: true, example: [2, 4, 7] })
  @IsNumber({}, { each: true })
  assignedUsers: number[]

  @ApiProperty({
    enum: Priority,
    examples: [Priority.Low, Priority.Average, Priority.High]
  })
  @IsEnum(Priority)
  priority: Priority
}
