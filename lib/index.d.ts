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
export declare function buildPaginator<Entity>(options: PagniationOtions<Entity>): Paginator<Entity>;
