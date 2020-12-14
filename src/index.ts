import { ObjectType } from 'typeorm';

import Paginator, { Order, Cursor, PagingResult } from './Paginator';

export { Order, Cursor, PagingResult };

export interface PagingQuery {
  afterCursor?: string;
  beforeCursor?: string;
  limit?: number;
  order?: Order;
}

export interface PaginationKey<ReturnEntity> {
  entity: ObjectType<any>;
  alias?: string;
  keys: string[];
  mappingProperty?: (returnEntity: ReturnEntity) => any;
}
export interface PagniationOtions<Entity> {
  returnEntity: ObjectType<Entity>;
  query?: PagingQuery;
  paginationKeys?: PaginationKey<Entity>[];
}

export function buildPaginator<Entity>(
  options: PagniationOtions<Entity>,
): Paginator<Entity> {
  const {
    returnEntity,
    query = {},
    paginationKeys = [
      {
        entity: options.returnEntity,
        alias: returnEntity.name.toLowerCase(),
        keys: ['id'],
      },
    ],
  } = options;

  const paginator = new Paginator<Entity>(paginationKeys);

  if (query.afterCursor) {
    paginator.setAfterCursor(query.afterCursor);
  }

  if (query.beforeCursor) {
    paginator.setBeforeCursor(query.beforeCursor);
  }

  if (query.limit) {
    paginator.setLimit(query.limit);
  }

  if (query.order) {
    paginator.setOrder(query.order);
  }

  return paginator;
}
