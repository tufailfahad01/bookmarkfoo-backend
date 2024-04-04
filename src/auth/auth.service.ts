import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
    private jwtService: JwtService,
  ) { }

  async register(createUserDto: CreateUserDto) {
    const user = await this.userModel.findOne({ email: createUserDto.email });

    if (!user) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const newUser = await this.userModel.create({
          ...createUserDto,
          password: hashedPassword,
        })

        const payload = ({ id: newUser._id, email: newUser.email });
        const accessToken = this.jwtService.sign(payload)
        return {
          data: newUser,
          accessToken: accessToken
        };
      } catch (err) {
        throw new BadRequestException(err.message)
      }
    }
    else {
      throw new ConflictException('User already Exist')
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ email: email });
    if (user) {
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        throw new UnauthorizedException('Incorrect Email or Password');
      }

      const payload = ({ id: user._id, email: user.email });
      const accessToken = this.jwtService.sign(payload)
      return {
        data: user,
        accessToken: accessToken
      };
    }
    else {
      throw new UnauthorizedException('Incorrect Email or Password');
    }
  }

}