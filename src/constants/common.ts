export interface PageData<T> {
  page: number;
  size: number;
  total: number;
  query: string;
  payload: T[];
}
