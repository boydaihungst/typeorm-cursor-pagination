import { getConnection } from 'typeorm';
import { User } from '../entities/User';

export async function prepareData(): Promise<void> {
  const data = [...Array(10).keys()].map((i) => ({
    name: `user${i}`,
    timestamp: new Date(),
    photos: [
      {
        link: `http://photo.com/${i + 1}`,
      },
    ],
    address: {
      country: `country${i + 1}`,
    },
  }));

  await getConnection().getRepository(User).save(data);
}
