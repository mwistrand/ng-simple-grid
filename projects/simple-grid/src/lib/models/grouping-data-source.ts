import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { Observable, combineLatest, map, isObservable, of } from 'rxjs';
import { GroupConfig, GroupedRow } from './group-config';
import { GroupStateService } from '../services/group-state.service';

/**
 * Internal data source that transforms flat data into grouped rows.
 * This is created and managed internally by SgTableComponent.
 * Developers don't interact with this class directly.
 */
export class GroupingDataSource<T> extends DataSource<GroupedRow<T>> {
  private groupKeys: string[] = [];

  constructor(
    private readonly sourceDataSource: DataSource<T> | Observable<readonly T[]> | readonly T[],
    private readonly groupConfig: GroupConfig<T>,
    private readonly groupState: GroupStateService,
  ) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<readonly GroupedRow<T>[]> {
    // Convert source to observable
    let source$: Observable<readonly T[]>;

    if (this.sourceDataSource instanceof DataSource) {
      source$ = this.sourceDataSource.connect(collectionViewer);
    } else if (isObservable(this.sourceDataSource)) {
      source$ = this.sourceDataSource;
    } else {
      source$ = of(this.sourceDataSource as readonly T[]);
    }

    // Combine with group state changes to re-render when groups expand/collapse
    return combineLatest([source$, this.groupState.changes$]).pipe(
      map(([data]) => this.transformData(data)),
    );
  }

  disconnect(collectionViewer: CollectionViewer): void {
    if (this.sourceDataSource instanceof DataSource) {
      this.sourceDataSource.disconnect(collectionViewer);
    }
  }

  private transformData(data: readonly T[]): GroupedRow<T>[] {
    const result: GroupedRow<T>[] = [];
    const { groupBy } = this.groupConfig;

    // Extract group value from item
    const getGroupValue = (item: T): string | number => {
      if (typeof groupBy === 'function') {
        return groupBy(item);
      }
      return item[groupBy] as string | number;
    };

    // Group data
    const groups = new Map<string | number, T[]>();
    for (const item of data) {
      const groupValue = getGroupValue(item);
      if (!groups.has(groupValue)) {
        groups.set(groupValue, []);
      }
      groups.get(groupValue)!.push(item);
    }

    // Track group keys for state initialization
    this.groupKeys = Array.from(groups.keys()).map((v) => String(v));

    // Initialize group state if this is first run
    if (this.groupConfig.initialCollapsed !== undefined) {
      const allCollapsed = this.groupKeys.every((key) => !this.groupState.isExpanded(key));
      const allExpanded = this.groupKeys.every((key) => this.groupState.isExpanded(key));

      // Only initialize if state is completely unset
      if (allCollapsed && allExpanded) {
        this.groupState.initializeGroups(this.groupKeys, !this.groupConfig.initialCollapsed);
      }
    } else {
      // Default to expanded
      const anySet = this.groupKeys.some((key) => this.groupState.isExpanded(key));
      if (!anySet) {
        this.groupState.expandAll(this.groupKeys);
      }
    }

    // Build grouped rows
    for (const [groupValue, items] of groups) {
      const groupKey = String(groupValue);
      const isExpanded = this.groupState.isExpanded(groupKey);

      // Add group header
      result.push({
        type: 'group',
        groupKey,
        groupValue,
        count: items.length,
        isExpanded,
      });

      // Add data rows if expanded
      if (isExpanded) {
        for (const item of items) {
          result.push({
            type: 'data',
            data: item,
            groupKey,
          });
        }
      }
    }

    return result;
  }
}
