import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  content: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
