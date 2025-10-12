import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { map, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { SgTableLoadingDirection } from './config';

export type CdkTableDataSourceInput<T> = readonly T[] | Observable<readonly T[]> | DataSource<T>;

export interface VirtualizedDataUpdate<T> {
  data: readonly T[];
  removedCount: number;
}

export class VirtualizedDataSource<T> extends DataSource<T> {
  private readonly dataSubject = new ReplaySubject<VirtualizedDataUpdate<T>>(1);

  private currentDirection?: SgTableLoadingDirection;
  private dataSourceSubscription?: Subscription;
  private allData: readonly T[] = [];
  private currentData: readonly T[] = [];
  private startPointer = 0;
  private endPointer = 0;

  public readonly updates$ = this.dataSubject.asObservable();

  constructor(
    private readonly dataSource: CdkTableDataSourceInput<T>,
    private readonly maxRenderItemCount: number = Infinity,
    private readonly pageSize: number = 50,
  ) {
    super();
    this.startPointer = 0;
    this.endPointer = pageSize;
  }

  connect(collectionViewer: CollectionViewer): Observable<readonly T[]> {
    let observable$: Observable<readonly T[]>;

    if (this.dataSource instanceof Observable) {
      observable$ = this.dataSource;
    } else if (this.dataSource instanceof DataSource) {
      observable$ = this.dataSource.connect(collectionViewer);
    } else {
      observable$ = of(this.dataSource);
    }

    if (this.maxRenderItemCount === Infinity) {
      return observable$;
    }

    this.dataSourceSubscription = observable$.subscribe((data) => {
      const { currentData, maxRenderItemCount, pageSize } = this;
      this.allData = data;
      if (this.currentDirection === 'next') {
        this.endPointer = data.length;
        this.startPointer = Math.max(0, this.endPointer - this.maxRenderItemCount);
      } else {
        this.startPointer = 0;
        this.endPointer = Math.min(data.length, this.maxRenderItemCount);
      }
      const removedCount = currentData.length + pageSize - maxRenderItemCount;
      this.currentData = data.slice(this.startPointer, this.endPointer);
      this.dataSubject.next({
        data: this.currentData,
        removedCount,
      });
      this.currentDirection = undefined;
    });

    return this.dataSubject.asObservable().pipe(map(({ data }) => data));
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.dataSubject.complete();
    if (this.dataSource instanceof DataSource) {
      this.dataSource.disconnect(collectionViewer);
    }
    if (this.dataSourceSubscription != null) {
      this.dataSourceSubscription.unsubscribe();
    }
  }

  loadMoreData(direction: SgTableLoadingDirection): boolean {
    if (direction === 'next') {
      return this.loadNext();
    } else {
      return this.loadPrevious();
    }
  }

  private loadNext(): boolean {
    this.currentDirection = 'next';

    const { allData, startPointer, endPointer, pageSize, maxRenderItemCount } = this;
    const newEndPointer = endPointer + pageSize;
    if (newEndPointer > allData.length) {
      return true;
    }
    const newStartPointer =
      newEndPointer - startPointer <= maxRenderItemCount
        ? startPointer
        : newEndPointer - maxRenderItemCount;
    this.startPointer = Math.max(0, newStartPointer);
    this.endPointer = Math.min(newEndPointer, allData.length);
    const removedCount = this.currentData.length + pageSize - maxRenderItemCount;
    this.currentData = allData.slice(this.startPointer, this.endPointer);
    this.dataSubject.next({
      data: this.currentData,
      removedCount,
    });
    return false;
  }

  private loadPrevious(): boolean {
    this.currentDirection = 'previous';

    const { allData, startPointer, pageSize, maxRenderItemCount } = this;
    const newStartPointer = startPointer - pageSize;
    if (newStartPointer < 0) {
      return true;
    }
    this.startPointer = newStartPointer;
    this.endPointer -= pageSize;
    const removedCount = this.currentData.length + pageSize - maxRenderItemCount;
    this.currentData = allData.slice(this.startPointer, this.endPointer);
    this.dataSubject.next({
      data: this.currentData,
      removedCount,
    });
    return false;
  }
}
