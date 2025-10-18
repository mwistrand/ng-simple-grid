export interface RowGroup<T = any> {
  groupKey: string;
  groupPath: string[];
  groupName: string;
  items: T[];
  startIndex: number;
  endIndex: number;
}

export interface GroupedData<T = any> {
  groups: RowGroup<T>[];
  flatData: T[];
  groupMap: Map<T, RowGroup<T>>;
}
