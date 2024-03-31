import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { Category } from 'src/schemas/category.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Link } from 'src/schemas/link.schema';

@Injectable()
export class LinksService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Link.name) private readonly linkModel: Model<Link>
  ){}
 async create(createLinkDto: CreateLinkDto):Promise<Link> {
   const existingCategory = await this.categoryModel.findOne({ _id: createLinkDto.category }).lean();
    const existingLink = await this.linkModel.findOne({ url:createLinkDto.url, category:createLinkDto.category }).lean();

    if (existingLink) {
      throw new ConflictException('Link of this category already exists');
    }

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }
    try {
      const newLink = await this.linkModel.create({ ...createLinkDto});
      return newLink;
    } catch (error) {
      throw new BadRequestException('Failed to create category', error);
    }
  }

  async findAll():Promise<Link[]> {
    try{
      return await this.linkModel.find();
    }
    catch(error){
      throw new BadRequestException
    }
  }

  async findOne(id: string):Promise<Link> {
    const isValidID = mongoose.isValidObjectId(id);
      if (!isValidID) {
        throw new BadRequestException("Invalid ID");
      }
    const link = await this.linkModel.findById(id).exec();
    if (!link) {
      throw new NotFoundException('Link not found');
    }
    return link;
  }

  async update(id: string, updateLinkDto: UpdateLinkDto):Promise<Link> {
    try {
      const isValidID = mongoose.isValidObjectId(id);
      if (!isValidID) {
        throw new BadRequestException("Invalid ID");
      }
      const link = await this.linkModel.findById({_id:id}).exec();
      if (!link) {
        throw new NotFoundException('Link not found');
      }
      const updatedLink = await this.linkModel.findByIdAndUpdate({ _id: id }, updateLinkDto, { new: true }).exec();
      return updatedLink
    } catch (error) {
      throw new BadRequestException('Failed to update Link', error);
    }
  }

  async remove(id: string):Promise<void> {
   try{ 
    const deletedLink = await this.linkModel.findByIdAndDelete({_id:id}).exec();
    if (!deletedLink) {
      throw new NotFoundException('Link not found');
    }
    return;
  }
  catch(error){
    throw new BadRequestException('Failed to delete Link', error);
  }
  }
}
