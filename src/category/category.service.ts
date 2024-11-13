import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
    const existingCategory = await this.categoryModel
      .findOne({ name: createCategoryDto.name })
      .exec();
    if (existingCategory) {
      throw new BadRequestException('Category with this name already exists');
    }

    console.log(createCategoryDto);
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAllWithPublishedTopics(): Promise<any[]> {
    const categories = await this.categoryModel.find().exec();
    const categoriesWithPublishedTopics = await Promise.all(
      categories.map(async (category) => {
        const publishedTopics = await this.topicModel
          .find({
            category: category._id,
            is_Published: true,
            isDeleted: false,
          })
          .exec();

        if (publishedTopics.length > 0) {
          return {
            ...category.toObject(),
            topicCount: publishedTopics.length,
          };
        } else {
          return null;
        }
      }),
    );

    return categoriesWithPublishedTopics.filter(
      (category) => category !== null,
    );
  }

  async findAll(): Promise<any[]> {
    const categories = await this.categoryModel.find().exec();
  
    const categoriesWithTopicCount = categories.map((category) => {
      const topicCount = category.topics ? category.topics.length : 0; 
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

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category | null> {
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryModel
        .findOne({ name: updateCategoryDto.name })
        .exec();
      if (existingCategory && existingCategory._id.toString() !== id) {
        throw new BadRequestException('Category with this name already exists');
      }
    }

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

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

    await this.topicModel
      .updateMany(
        { category: categoryToDelete._id },
        { $unset: { category: '' } },
      )
      .exec();
    return this.categoryModel.findByIdAndDelete(id).exec();
  }
}
