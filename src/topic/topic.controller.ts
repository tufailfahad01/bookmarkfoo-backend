import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GetUser } from 'src/auth/GetUser.Decorator';
import { User } from 'src/schemas/user.schema';
import { Topic } from 'src/schemas/topic.schema';

import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ReportQueryParams } from './dto/report-query-params.dto';
import { IsAdmin } from 'src/utils/helper';
import { Order } from 'src/schemas/order.schema';
import { GetTopicsDto } from './dto/get-topics.dto';

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  create(@Body() createTopicDto: CreateTopicDto, @GetUser() user: User) {
    IsAdmin(user);
    return this.topicService.create(createTopicDto, user);
  }

  @Get('types')
  async getUniqueTypes(): Promise<{ array: string[] }> {
    return this.topicService.getUniqueTypes();
  }

  @Post('getAll')
findAll(@Body() filterDto: { categoryId?: string }) {
  return this.topicService.findAll(filterDto);
}


  @Post('filter') // Changed to POST and added 'filter' endpoint
  async gettopics(
    @Body() getTopicsDto: GetTopicsDto,
  ): Promise<Topic[]> {
    return this.topicService.getTopics(getTopicsDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getReport')
  async getReport(
    @Query(ValidationPipe) queryParams: ReportQueryParams,
    @GetUser() user: User,
  ): Promise<{
    topics: Topic[];
    linksDownloaded: number;
    categoryPurchased: number;
    totalOrders: number;
    orders: Order[];
  }> {
    IsAdmin(user);
    return this.topicService.getReport(queryParams);
  }

  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.topicService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
    @GetUser() user: User,
  ) {
    IsAdmin(user);
    return this.topicService.update(id, updateTopicDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    IsAdmin(user);
    return this.topicService.remove(id);
  }
}
