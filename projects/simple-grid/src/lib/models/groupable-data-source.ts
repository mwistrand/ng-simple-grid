import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { SgTableGroupingConfig } from './grouping-config';

export interface SortState {
  active: string;
  direction: 'asc' | 'desc' | '';
}

interface GroupInfo<T> {
  groupPath: string[];
  items: T[];
}

export class GroupableDataSource<T> extends DataSource<T> {
  private dataSubject = new BehaviorSubject<T[]>([]);
  private userGroupsMap = new Map<T, string>();
  private sortSubject = new BehaviorSubject<SortState | null>(null);

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
    for (const [, items] of groups) {
      result.push(...items);
    }

    return result;
  }

  private getGroupPath(item: T): string[] {
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
    for (const [, items] of groups) {
      result.push(...this.sortData(items, sort));
    }

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
