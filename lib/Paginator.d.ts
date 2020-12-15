import { ObjectType, SelectQueryBuilder } from 'typeorm';
export declare type Order = 'ASC' | 'DESC';
export declare type EscapeFn = (name: string) => string;
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
    private paginationKeys;
    private afterCursor;
    private beforeCursor;
    private nextAfterCursor;
    private nextBeforeCursor;
    private limit;
    private order;
    constructor(paginationKeys: {
        entity: ObjectType<any>;
        alias?: string;
        keys: string[];
        mappingProperty?: (returnEntity: Entity) => any;
    }[]);
    setAfterCursor(cursor: string): void;
    setBeforeCursor(cursor: string): void;
    setLimit(limit: number): void;
    setOrder(order: Order): void;
    paginate(builder: SelectQueryBuilder<Entity>): Promise<PagingResult<Entity>>;
    private getCursor;
    private appendPagingQuery;
    private buildCursorQuery;
    private getOperator;
    private buildOrder;
    private hasAfterCursor;
    private hasBeforeCursor;
    private encode;
    private decode;
    private getEntityPropertyType;
    private flipOrder;
    private toPagingResult;
}
