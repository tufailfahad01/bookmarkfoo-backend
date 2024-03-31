import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: 'ddixiuh7h',
      api_key: '482582987775339',
      api_secret: 'i9TTJXfui_uxxgIZgtDAhRva09s'
    });
  },
};