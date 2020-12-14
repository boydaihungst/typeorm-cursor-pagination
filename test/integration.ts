import { expect } from 'chai';
import { createConnection, getConnection } from 'typeorm';

import { createQueryBuilder } from './utils/createQueryBuilder';
import { prepareData } from './utils/prepareData';
import { User } from './entities/User';
import { Photo } from './entities/Photo';
import { buildPaginator } from '../src/index';
import { Address } from './entities/Address';

describe('TypeORM cursor-based pagination test', () => {
  before(async () => {
    await createConnection({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'archivedfile',
      password: 'Anhhoang123',
      database: 'archivedfile',
      synchronize: true,
      entities: [User, Photo, Address],
      logging: true,
    });
    await prepareData();
  });

  it('should paginate correctly with before and after cursor', async () => {
    const queryBuilder = createQueryBuilder().leftJoinAndSelect(
      'user.photos',
      'photo',
    );
    const firstPagePaginator = buildPaginator({
      returnEntity: User,
      paginationKeys: [
        {
          entity: User,
          keys: ['id', 'name', 'timestamp'],
          alias: 'user',
        },
      ],
      query: {
        limit: 1,
      },
    });
    const firstPageResult = await firstPagePaginator.paginate(
      queryBuilder.clone(),
    );

    const nextPagePaginator = buildPaginator({
      returnEntity: User,
      paginationKeys: [
        {
          entity: User,
          keys: ['id', 'name', 'timestamp'],
          alias: 'user',
        },
      ],
      query: {
        limit: 1,
        afterCursor: firstPageResult.cursor.afterCursor as string,
      },
    });
    const nextPageResult = await nextPagePaginator.paginate(
      queryBuilder.clone(),
    );

    const prevPagePaginator = buildPaginator({
      returnEntity: User,
      paginationKeys: [
        {
          entity: User,
          keys: ['id', 'name', 'timestamp'],
          alias: 'user',
        },
      ],
      query: {
        limit: 1,
        beforeCursor: nextPageResult.cursor.beforeCursor as string,
      },
    });
    const prevPageResult = await prevPagePaginator.paginate(
      queryBuilder.clone(),
    );

    expect(firstPageResult.cursor.beforeCursor).to.eq(null);
    expect(firstPageResult.cursor.afterCursor).to.not.eq(null);
    expect(firstPageResult.data[0].id).to.eq(10);

    expect(nextPageResult.cursor.beforeCursor).to.not.eq(null);
    expect(nextPageResult.cursor.afterCursor).to.not.eq(null);
    expect(nextPageResult.data[0].id).to.eq(9);

    expect(prevPageResult.cursor.beforeCursor).to.eq(null);
    expect(prevPageResult.cursor.afterCursor).to.not.eq(null);
    expect(prevPageResult.data[0].id).to.eq(10);
  });

  it('should correctly paginate entities with one-to-one relation pagination keys', async () => {
    const queryBuilder = createQueryBuilder().leftJoinAndSelect(
      'user.address',
      'address',
    );
    const paginator = buildPaginator({
      returnEntity: User,
      paginationKeys: [
        {
          entity: Address,
          keys: ['id', 'country'],
          mappingProperty: (returnEntity: User) => returnEntity.address,
        },
      ],
      query: {
        limit: 1,
      },
    });
    const firstPageResult = await paginator.paginate(queryBuilder);

    const nextPagePaginator = buildPaginator({
      returnEntity: User,
      paginationKeys: [
        {
          entity: Address,
          keys: ['id', 'country'],
          mappingProperty: (returnEntity: User) => returnEntity.address,
        },
      ],
      query: {
        limit: 1,
        afterCursor: firstPageResult.cursor.afterCursor as string,
      },
    });
    const nextPageResult = await nextPagePaginator.paginate(
      queryBuilder.clone(),
    );

    const prevPagePaginator = buildPaginator({
      returnEntity: User,
      paginationKeys: [
        {
          entity: Address,
          keys: ['id', 'country'],
          mappingProperty: (returnEntity: User) => returnEntity.address,
        },
      ],
      query: {
        limit: 1,
        beforeCursor: nextPageResult.cursor.beforeCursor as string,
      },
    });
    const prevPageResult = await prevPagePaginator.paginate(
      queryBuilder.clone(),
    );
    expect(firstPageResult.cursor.beforeCursor).to.eq(null);
    expect(firstPageResult.cursor.afterCursor).to.not.eq(null);
    expect(firstPageResult.data[0].address.id).to.eq(10);
    expect(firstPageResult.data[0].address.country).to.eq(`country${10}`);

    expect(nextPageResult.cursor.beforeCursor).to.not.eq(null);
    expect(nextPageResult.cursor.afterCursor).to.not.eq(null);
    expect(nextPageResult.data[0].address.id).to.eq(9);
    expect(nextPageResult.data[0].address.country).to.eq(`country${9}`);

    expect(prevPageResult.cursor.beforeCursor).to.eq(null);
    expect(prevPageResult.cursor.afterCursor).to.not.eq(null);
    expect(prevPageResult.data[0].address.id).to.eq(10);
    expect(prevPageResult.data[0].address.country).to.eq(`country${10}`);
  });

  it('should correctly paginate entities with one-to-many relation pagination keys', async () => {
    const queryBuilder = createQueryBuilder().leftJoinAndSelect(
      'user.photos',
      'photo',
    );
    const paginator = buildPaginator({
      returnEntity: User,
      paginationKeys: [
        {
          entity: Photo,
          keys: ['id', 'link'],
          mappingProperty: (returnEntity: User) => returnEntity.photos[0],
        },
      ],
      query: {
        limit: 1,
      },
    });
    const firstPageResult = await paginator.paginate(queryBuilder);

    const nextPagePaginator = buildPaginator({
      returnEntity: User,
      paginationKeys: [
        {
          entity: Photo,
          keys: ['id', 'link'],
          mappingProperty: (returnEntity: User) => returnEntity.photos[0],
        },
      ],
      query: {
        limit: 1,
        afterCursor: firstPageResult.cursor.afterCursor as string,
      },
    });
    const nextPageResult = await nextPagePaginator.paginate(
      queryBuilder.clone(),
    );

    const prevPagePaginator = buildPaginator({
      returnEntity: User,
      paginationKeys: [
        {
          entity: Photo,
          keys: ['id', 'link'],
          mappingProperty: (returnEntity: User) => returnEntity.photos[0],
        },
      ],
      query: {
        limit: 1,
        beforeCursor: nextPageResult.cursor.beforeCursor as string,
      },
    });
    const prevPageResult = await prevPagePaginator.paginate(
      queryBuilder.clone(),
    );
    expect(firstPageResult.cursor.beforeCursor).to.eq(null);
    expect(firstPageResult.cursor.afterCursor).to.not.eq(null);
    expect(firstPageResult.data[0].photos[0].id).to.eq(10);
    expect(firstPageResult.data[0].photos[0].link).to.eq(
      `http://photo.com/${10}`,
    );

    expect(nextPageResult.cursor.beforeCursor).to.not.eq(null);
    expect(nextPageResult.cursor.afterCursor).to.not.eq(null);
    expect(nextPageResult.data[0].photos[0].id).to.eq(9);
    expect(nextPageResult.data[0].photos[0].link).to.eq(
      `http://photo.com/${9}`,
    );

    expect(prevPageResult.cursor.beforeCursor).to.eq(null);
    expect(prevPageResult.cursor.afterCursor).to.not.eq(null);
    expect(prevPageResult.data[0].photos[0].id).to.eq(10);
    expect(prevPageResult.data[0].photos[0].link).to.eq(
      `http://photo.com/${10}`,
    );
  });

  it('should return entities with given order', async () => {
    const queryBuilder = createQueryBuilder();
    const ascPaginator = buildPaginator({
      returnEntity: User,
      query: {
        limit: 1,
        order: 'ASC',
      },
    });
    const descPaginator = buildPaginator({
      returnEntity: User,
      query: {
        limit: 1,
        order: 'DESC',
      },
    });

    const ascResult = await ascPaginator.paginate(queryBuilder.clone());
    const descResult = await descPaginator.paginate(queryBuilder.clone());

    expect(ascResult.data[0].id).to.eq(1);
    expect(descResult.data[0].id).to.eq(10);
  });

  it('should return entities with given limit', async () => {
    const queryBuilder = createQueryBuilder();
    const paginator = buildPaginator({
      returnEntity: User,
      query: {
        limit: 10,
      },
    });

    const result = await paginator.paginate(queryBuilder);

    expect(result.data).length(10);
  });

  it('should return empty array and null cursor if no data', async () => {
    const queryBuilder = createQueryBuilder().where('user.id > :id', {
      id: 10,
    });
    const paginator = buildPaginator({
      returnEntity: User,
    });
    const result = await paginator.paginate(queryBuilder);

    expect(result.data).length(0);
    expect(result.cursor.beforeCursor).to.eq(null);
    expect(result.cursor.afterCursor).to.eq(null);
  });

  it('should correctly paginate entities with camel-cased pagination keys', async () => {
    const queryBuilder = createQueryBuilder();
    const paginator = buildPaginator({
      returnEntity: User,
      paginationKeys: [
        {
          entity: User,
          keys: ['id', 'createdAt'],
        },
      ],
    });
    const result = await paginator.paginate(queryBuilder);

    expect(result.data).length(10);
  });

  after(async () => {
    await getConnection().close();
  });
});
