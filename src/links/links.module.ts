import { Module } from '@nestjs/common';
import { LinksService } from './links.service';
import { LinksController } from './links.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LinkSchema } from 'src/schemas/link.schema';
import { CategorySchema } from 'src/schemas/category.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{name:'Link' , schema:LinkSchema}]),
    MongooseModule.forFeature([{name:'Category' , schema:CategorySchema}])
  ],
  controllers: [LinksController],
  providers: [LinksService],
})
export class LinksModule {}
