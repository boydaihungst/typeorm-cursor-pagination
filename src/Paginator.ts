/* eslint-disable no-param-reassign */
import {
  Brackets,
  ObjectType,
  OrderByCondition,
  SelectQueryBuilder,
  WhereExpression,
} from 'typeorm';

import { atob, btoa, encodeByType, decodeByType } from './utils';

export type Order = 'ASC' | 'DESC';

export type EscapeFn = (name: string) => string;

interface CursorParam {
  [key: string]: any;
}

export interface Cursor {
  beforeCursor: string | null;
  afterCursor: string | null;
}

export interface PagingResult<Entity> {
  data: Entity[];
  total: number;
  cursor: Cursor;
}

export default class Paginator<Entity> {
  private afterCursor: string | null = null;

  private beforeCursor: string | null = null;

  private nextAfterCursor: string | null = null;

  private nextBeforeCursor: string | null = null;

  private limit = 100;

  private order: Order = 'DESC';

  public constructor(
    private paginationKeys: {
      entity: ObjectType<any>;
      alias?: string;
      keys: string[];
      mappingProperty?: (returnEntity: Entity) => any;
    }[],
  ) {
    paginationKeys.forEach((x) => {
      if (!x.alias) {
        x.alias = x.entity.name.toLowerCase();
      }
      if (!x.mappingProperty || typeof x.mappingProperty !== 'function') {
        x.mappingProperty = (returnEntity: any) => returnEntity;
      }
    });
  }

  public setAfterCursor(cursor: string): void {
    this.afterCursor = cursor;
  }

  public setBeforeCursor(cursor: string): void {
    this.beforeCursor = cursor;
  }

  public setLimit(limit: number): void {
    this.limit = limit;
  }

  public setOrder(order: Order): void {
    this.order = order;
  }

  public async paginate(
    builder: SelectQueryBuilder<Entity>,
  ): Promise<PagingResult<Entity>> {
    const [entities, total] = await this.appendPagingQuery(
      builder,
    ).getManyAndCount();
    const hasMore = entities.length > this.limit;

    if (hasMore) {
      entities.splice(entities.length - 1, 1);
    }

    if (entities.length === 0) {
      return this.toPagingResult(entities, total);
    }

    if (!this.hasAfterCursor() && this.hasBeforeCursor()) {
      entities.reverse();
      entities.reverse();
    }

    if (this.hasBeforeCursor() || hasMore) {
      this.nextAfterCursor = this.encode(entities[entities.length - 1]);
    }

    if (this.hasAfterCursor() || (hasMore && this.hasBeforeCursor())) {
      this.nextBeforeCursor = this.encode(entities[0]);
    }

    return this.toPagingResult(entities, total);
  }

  private getCursor(): Cursor {
    return {
      afterCursor: this.nextAfterCursor,
      beforeCursor: this.nextBeforeCursor,
    };
  }

  private appendPagingQuery(
    builder: SelectQueryBuilder<Entity>,
  ): SelectQueryBuilder<Entity> {
    const cursors: CursorParam = {};
    const { escape } = builder.connection.driver;

    if (this.hasAfterCursor()) {
      Object.assign(cursors, this.decode(this.afterCursor as string));
    } else if (this.hasBeforeCursor()) {
      Object.assign(cursors, this.decode(this.beforeCursor as string));
    }

    if (Object.keys(cursors).length > 0) {
      builder.andWhere(
        new Brackets((where) => this.buildCursorQuery(where, cursors, escape)),
      );
    }

    builder.take(this.limit + 1);
    builder.orderBy(this.buildOrder());

    return builder;
  }

  private buildCursorQuery(
    where: WhereExpression,
    cursors: CursorParam,
    escape: EscapeFn,
  ): void {
    const operator = this.getOperator();
    const params: CursorParam = {};
    let query = '';
    this.paginationKeys.forEach((obj) => {
      obj.keys.forEach((key) => {
        const param = `${obj.alias}_${key}`;
        params[param] = cursors[param];
        where.orWhere(
          `${query}${escape(obj.alias as any)}.${escape(
            key,
          )} ${operator} :${param}`,
          params,
        );
        query = `${query}${escape(obj.alias as any)}.${escape(
          key,
        )} = :${param} AND `;
      });
    });
  }

  private getOperator(): string {
    if (this.hasAfterCursor()) {
      return this.order === 'ASC' ? '>' : '<';
    }

    if (this.hasBeforeCursor()) {
      return this.order === 'ASC' ? '<' : '>';
    }

    return '=';
  }

  private buildOrder(): OrderByCondition {
    let { order } = this;

    if (!this.hasAfterCursor() && this.hasBeforeCursor()) {
      order = this.flipOrder(order);
    }

    const orderByCondition: OrderByCondition = {};
    this.paginationKeys.forEach((obj) => {
      obj.keys.forEach((key) => {
        orderByCondition[
          `${escape(obj.alias as any)}.${escape(key as any)}`
        ] = order;
      });
    });

    return orderByCondition;
  }

  private hasAfterCursor(): boolean {
    return this.afterCursor !== null;
  }

  private hasBeforeCursor(): boolean {
    return this.beforeCursor !== null;
  }

  private encode(entity: any): string {
    const payload: string[] = [];
    this.paginationKeys.forEach((obj) => {
      obj.keys.forEach((key) => {
        const param = `${obj.alias}_${key}`;
        const type = this.getEntityPropertyType(key, obj.entity);
        const entityValue =
          // eslint-disable-next-line no-nested-ternary
          typeof obj.mappingProperty === 'function'
            ? obj.mappingProperty(entity)
              ? obj.mappingProperty(entity)[key]
              : null
            : null;
        const value = encodeByType(type, entityValue);
        payload.push(`${param}:${type}:${value}`);
      });
    });

    return btoa(payload.join(','));
  }

  private decode(cursor: string): CursorParam {
    const cursors: CursorParam = {};
    const columns = atob(cursor).split(',');
    columns.forEach((column) => {
      const [param, type, raw] = column.split(':');
      const value = decodeByType(type, raw);
      cursors[param] = value;
    });

    return cursors;
  }

  private getEntityPropertyType(
    key: string,
    entity: ObjectType<Entity>,
  ): string {
    return Reflect.getMetadata(
      'design:type',
      entity.prototype,
      key,
    ).name.toLowerCase();
  }

  private flipOrder(order: Order): Order {
    return order === 'ASC' ? 'DESC' : 'ASC';
  }

  private toPagingResult<Entity>(
    entities: Entity[],
    total: number,
  ): PagingResult<Entity> {
    return {
      data: entities,
      total,
      cursor: this.getCursor(),
    };
  }
}
