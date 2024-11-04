import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from 'src/schemas/category.schema';
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  

  @Get()
  findAll(): Promise<any[]> {
    return this.categoryService.findAll();
  }

  @Post('create')
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    console.log('createCategoryDto', createCategoryDto)
    return this.categoryService.create(createCategoryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Category | null> {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category | null> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Category | null> {
    return this.categoryService.remove(id);
  }
}
