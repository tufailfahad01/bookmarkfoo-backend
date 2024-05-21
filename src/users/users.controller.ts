import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/schemas/user.schema';
import { GetUser } from 'src/auth/GetUser.Decorator';
import { IsAdmin } from 'src/utils/helper';
import { ContactUsDto } from './dto/contact-us.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('createUser')
  create(
    @Body() createUserDto: CreateUserDto,
    @GetUser() user: User
  ) {
    IsAdmin(user);
    return this.usersService.create(createUserDto);
  }

  @Post('contactUs')
  contactUs(
    @Body() contactUs: ContactUsDto,
    @GetUser() user: User
  ) {
    return this.usersService.contactUs(contactUs, user);
  }

  @Get('getAllUser')
  findAll(@GetUser() user: User) {
    IsAdmin(user);
    return this.usersService.findAll();
  }

  @Get('getOneUser/:id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    IsAdmin(user);
    return this.usersService.findOne(id);
  }

  @Put('updateUser/:id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User
  ) {
    IsAdmin(user);
    return this.usersService.update(id, updateUserDto);
  }

  @Delete('deleteUser/:id')
  remove(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    IsAdmin(user);
    return this.usersService.remove(id);
  }

}
