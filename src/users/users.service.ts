import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

  async validateUser(email: string) {
    let user: any;
    user = await this.userModel.findOne({ email })
    if (user) {
      return user;
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<any> {
    const user = await this.userModel.findOne({ email: createUserDto.email });

    if (!user) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const newUser = await this.userModel.create({
          ...createUserDto,
          password: hashedPassword
        })
        const payload = ({ id: newUser._id, email: newUser.email });

        return newUser;
      } catch (err) {
        throw new BadRequestException(err.message)
      }
    }
    else {
      throw new ConflictException('User already Exist')
    }
  }

  async findAll(): Promise<any> {
    try {
      const users = await this.userModel.find().select('-password')
      console.log(users, 'users')
      return users;
    }
    catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const user = await this.findUser(id);
      if (!user) {
        throw new NotFoundException('User not found!');
      } else {
        return user;
      }
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    try {
      const user = await this.findUser(id);
      if (!user) {
        throw new NotFoundException('User not found!');
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(updateUserDto.password, salt);
        const user = await this.userModel.findByIdAndUpdate({ _id: id }, { ...updateUserDto, password: hashedPassword, updated_at: Date.now() }, { new: true });
        return user;
      }
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const user = await this.findUser(id);
      if (!user) {
        throw new NotFoundException('User not found!');
      } else {
        const user = await this.userModel.deleteOne({ _id: id });
        return {
          message: "Successfully deleted"
        };
      }
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async findUser(id: string) {
    const isValidID = mongoose.isValidObjectId(id);
    if (!isValidID) {
      throw new BadRequestException("Invalid ID");
    }
    const user = await this.userModel.findById(id).select('-password');
    return user;
  }
}
