export interface PageQuerier<Q> {
  page: number;
  size: number;
  query?: Q;
}

export interface PageData<T, Q> {
  page: number;
  size: number;
  total: number;
  query?: Q;
  payload: T[];
}
