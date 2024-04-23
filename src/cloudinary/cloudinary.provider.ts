import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: 'dplkbzr6j',
      api_key: '314742813151822',
      api_secret: 'DCQnbcPEx6fF1nEJ0SHknquujhA'
    });
  },
};