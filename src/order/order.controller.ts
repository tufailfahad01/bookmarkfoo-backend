import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/GetUser.Decorator';
import { User } from 'src/schemas/user.schema';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post('create')
  create(
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.create(createOrderDto);
  }

  @Get('findAll')
  findAll() {
    return this.orderService.findAll();
  }

  @Get('findOne/:id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('updateOrderStatus/:id')
  updateOrderStatus(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.updateOrderStatus(id, updateOrderDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
