import { Injectable } from '@nestjs/common';


@Injectable()
export class DownloadService {
  create(createDownloadDto: any) {
    return 'This action adds a new download';
  }

  findAll() {
    return `This action returns all download`;
  }

  findOne(id: number) {
    return `This action returns a #${id} download`;
  }

  update(id: number, updateDownloadDto: any) {
    return `This action updates a #${id} download`;
  }

  remove(id: number) {
    return `This action removes a #${id} download`;
  }
}
