import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from 'src/schemas/category.schema';
import { Topic } from 'src/schemas/topic.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Topic.name) private topicModel: Model<Topic>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if category with the same name already exists
    const existingCategory = await this.categoryModel.findOne({ name: createCategoryDto.name }).exec();
    if (existingCategory) {
      throw new BadRequestException('Category with this name already exists');
    }

    console.log(createCategoryDto);
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAll(): Promise<any[]> {
    const categories = await this.categoryModel.find().exec();
  
    // Map each category to include the count of topics from the topics array
    const categoriesWithTopicCount = categories.map((category) => {
      const topicCount = category.topics ? category.topics.length : 0; // Count the number of topic IDs in the topics array
      return {
        ...category.toObject(),
        topicCount,
      };
    });
  
    return categoriesWithTopicCount;
  }
  
  async findOne(id: string): Promise<Category | null> {
    return this.categoryModel.findById(id).exec();
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category | null> {
    // Check if the updated category name already exists
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryModel.findOne({ name: updateCategoryDto.name }).exec();
      if (existingCategory && existingCategory._id.toString() !== id) {
        throw new BadRequestException('Category with this name already exists');
      }
    }

    // Update the category
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, { new: true }).exec();
    
    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }

    return updatedCategory;
  }

  async remove(id: string): Promise<Category | null> {
    const categoryToDelete = await this.categoryModel.findById(id).exec();
    if (!categoryToDelete) {
        throw new NotFoundException('Category not found');
    }

    // Remove the category ID from associated topics
    await this.topicModel.updateMany(
        { category: categoryToDelete._id },
        { $unset: { category: "" } } // This removes the category field from the topic
    ).exec();

    // Delete the category
    return this.categoryModel.findByIdAndDelete(id).exec();
}

}
