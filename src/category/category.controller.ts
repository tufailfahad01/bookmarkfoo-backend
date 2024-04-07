import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GetUser } from 'src/auth/GetUser.Decorator';
import { User } from 'src/schemas/user.schema';
import { Category } from 'src/schemas/category.schema';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReportQueryParams } from './dto/report-query-params.dto';

@Controller('category')
@UseGuards(AuthGuard('jwt'))
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post('create')
  create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User) {
    return this.categoryService.create(createCategoryDto, user);
  }

  @Get('getAll')
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('getReport')
  async getReport(
    @Query(ValidationPipe) queryParams: ReportQueryParams
  ): Promise<{ categories: Category[], linksDownloaded: number, categoryPurchased: number }> {
    return this.categoryService.getReport(queryParams);
  }

  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
