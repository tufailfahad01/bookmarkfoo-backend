import { IsIn, IsDateString, IsOptional } from 'class-validator';

export class ReportQueryParams {
  @IsOptional()
  @IsIn(['name', 'popularity_count'])
  sortBy: 'name' | 'popularity_count';

  @IsOptional()
  @IsIn(['1', '-1'])
  order: '1' | '-1';

  @IsOptional()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate: string;
}