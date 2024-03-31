import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('link')
@UseGuards(AuthGuard('jwt'))
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post('create')
  create(@Body() createLinkDto: CreateLinkDto) {
    return this.linksService.create(createLinkDto);
  }

  @Get('getAll')
  findAll() {
    return this.linksService.findAll();
  }

  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.linksService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateLinkDto: UpdateLinkDto) {
    return this.linksService.update(id, updateLinkDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.linksService.remove(id);
  }
}
