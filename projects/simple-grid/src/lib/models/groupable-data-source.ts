import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { SgTableGroupingConfig } from './grouping-config';
import { GroupedData, RowGroup } from './row-group';

export interface SortState {
  active: string;
  direction: 'asc' | 'desc' | '';
}

export class GroupableDataSource<T> extends DataSource<T> {
  private dataSubject = new BehaviorSubject<T[]>([]);
  private userGroupsMap = new Map<T, string>();
  private sortSubject = new BehaviorSubject<SortState | null>(null);
  private groupedDataSubject = new BehaviorSubject<GroupedData<T> | null>(null);

  readonly groupedData$ = this.groupedDataSubject.asObservable();

  constructor(
    private config: SgTableGroupingConfig<T>,
    private trackByFn?: (index: number, item: T) => any,
  ) {
    super();
  }

  connect(): Observable<T[]> {
    return combineLatest([this.dataSubject, this.sortSubject]).pipe(
      map(([data, sort]) => {
        if (!data || data.length === 0) {
          this.groupedDataSubject.next(null);
          return [];
        }

        let groupedData = this.applyGrouping(data);

        if (sort?.active && sort?.direction) {
          groupedData = this.applySorting(groupedData, sort);
        }

        return groupedData;
      }),
    );
  }

  disconnect(): void {
    this.dataSubject.complete();
    this.sortSubject.complete();
    this.groupedDataSubject.complete();
  }

  setData(data: T[]): void {
    this.dataSubject.next(data);
  }

  setSort(sort: SortState | null): void {
    this.sortSubject.next(sort);
  }

  addUserGroup(groupName: string, items: T[]): void {
    items.forEach((item) => {
      this.userGroupsMap.set(item, groupName);
    });
    this.dataSubject.next(this.dataSubject.value);
  }

  getGroupForItem(item: T): RowGroup<T> | undefined {
    const groupedData = this.groupedDataSubject.value;
    return groupedData?.groupMap.get(item);
  }

  private applyGrouping(data: T[]): T[] {
    const groups = new Map<string, T[]>();

    for (const item of data) {
      const groupPath = this.getGroupPath(item);
      const groupKey = groupPath.join('|');

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    }

    const result: T[] = [];
    const rowGroups: RowGroup<T>[] = [];
    const groupMap = new Map<T, RowGroup<T>>();
    let currentIndex = 0;

    for (const [groupKey, items] of groups) {
      const groupPath = groupKey.split('|');
      const groupName = groupPath[groupPath.length - 1];
      const startIndex = currentIndex;
      const endIndex = currentIndex + items.length - 1;

      const rowGroup: RowGroup<T> = {
        groupKey,
        groupPath,
        groupName,
        items,
        startIndex,
        endIndex,
      };

      rowGroups.push(rowGroup);
      items.forEach((item) => {
        groupMap.set(item, rowGroup);
      });

      result.push(...items);
      currentIndex += items.length;
    }

    this.groupedDataSubject.next({
      groups: rowGroups,
      flatData: result,
      groupMap,
    });

    return result;
  }

  getGroupPath(item: T): string[] {
    const path: string[] = [];

    const userGroup = this.userGroupsMap.get(item);
    if (userGroup) {
      path.push(userGroup);
    }

    if (this.config.groupBy) {
      const { groupBy } = this.config;

      if (typeof groupBy === 'function') {
        const result = groupBy(item);
        if (Array.isArray(result)) {
          path.push(...result);
        } else {
          path.push(result);
        }
      } else if (Array.isArray(groupBy)) {
        for (const key of groupBy) {
          const value = item[key as keyof T];
          path.push(String(value));
        }
      } else {
        const value = item[groupBy as keyof T];
        path.push(String(value));
      }
    }

    return path.length > 0 ? path : ['default'];
  }

  private applySorting(data: T[], sort: SortState): T[] {
    const { sortWithinGroups = true } = this.config;

    if (!sortWithinGroups) {
      return this.sortData(data, sort);
    }

    const groups = new Map<string, T[]>();
    for (const item of data) {
      const groupPath = this.getGroupPath(item);
      const groupKey = groupPath.join('|');

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    }

    const result: T[] = [];
    const rowGroups: RowGroup<T>[] = [];
    const groupMap = new Map<T, RowGroup<T>>();
    let currentIndex = 0;

    for (const [groupKey, items] of groups) {
      const sortedItems = this.sortData(items, sort);
      const groupPath = groupKey.split('|');
      const groupName = groupPath[groupPath.length - 1];
      const startIndex = currentIndex;
      const endIndex = currentIndex + sortedItems.length - 1;

      const rowGroup: RowGroup<T> = {
        groupKey,
        groupPath,
        groupName,
        items: sortedItems,
        startIndex,
        endIndex,
      };

      rowGroups.push(rowGroup);
      sortedItems.forEach((item) => {
        groupMap.set(item, rowGroup);
      });

      result.push(...sortedItems);
      currentIndex += sortedItems.length;
    }

    this.groupedDataSubject.next({
      groups: rowGroups,
      flatData: result,
      groupMap,
    });

    return result;
  }

  private sortData(data: T[], sort: SortState): T[] {
    const sortedData = [...data];
    const { active, direction } = sort;

    if (!active || direction === '') {
      return sortedData;
    }

    return sortedData.sort((a, b) => {
      const valueA = (a as any)[active];
      const valueB = (b as any)[active];

      const comparison = this.compare(valueA, valueB);
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  private compare(a: any, b: any): number {
    if (a === b) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }

    return a < b ? -1 : 1;
  }
}
