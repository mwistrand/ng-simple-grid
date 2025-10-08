import { of, BehaviorSubject } from 'rxjs';
import { VirtualizedDataSource } from './virtualized-data-source';

describe('VirtualizedDataSource', () => {
  interface TestData {
    id: number;
    name: string;
  }

  const createTestData = (count: number): TestData[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
    }));
  };

  describe('with array data source', () => {
    it('should create an instance', () => {
      const data = createTestData(10);
      const dataSource = new VirtualizedDataSource(data);
      expect(dataSource).toBeTruthy();
    });

    it('should return all data when maxRenderItemCount is Infinity', (done) => {
      const data = createTestData(100);
      const dataSource = new VirtualizedDataSource(data);
      const mockCollectionViewer = { viewChange: of({ start: 0, end: 10 }) };

      dataSource.connect(mockCollectionViewer as any).subscribe((result) => {
        expect(result.length).toBe(100);
        done();
      });
    });

    it('should limit data to maxRenderItemCount', (done) => {
      const data = createTestData(100);
      const maxRenderItemCount = 50;
      const dataSource = new VirtualizedDataSource(data, maxRenderItemCount);
      const mockCollectionViewer = { viewChange: of({ start: 0, end: 10 }) };

      dataSource.connect(mockCollectionViewer as any).subscribe((result) => {
        expect(result.length).toBe(maxRenderItemCount);
        done();
      });
    });

    it('should use custom pageSize', (done) => {
      const data = createTestData(200);
      const maxRenderItemCount = 100;
      const pageSize = 25;
      const dataSource = new VirtualizedDataSource(data, maxRenderItemCount, pageSize);
      const mockCollectionViewer = { viewChange: of({ start: 0, end: 10 }) };

      dataSource.connect(mockCollectionViewer as any).subscribe((result) => {
        expect(result.length).toBe(maxRenderItemCount);
        done();
      });
    });
  });

  describe('with observable data source', () => {
    it('should handle observable data source', (done) => {
      const data = createTestData(50);
      const data$ = of(data);
      const dataSource = new VirtualizedDataSource(data$);
      const mockCollectionViewer = { viewChange: of({ start: 0, end: 10 }) };

      dataSource.connect(mockCollectionViewer as any).subscribe((result) => {
        expect(result.length).toBe(50);
        done();
      });
    });

    it('should handle observable data source with limit', (done) => {
      const data = createTestData(100);
      const data$ = of(data);
      const maxRenderItemCount = 50;
      const dataSource = new VirtualizedDataSource(data$, maxRenderItemCount);
      const mockCollectionViewer = { viewChange: of({ start: 0, end: 10 }) };

      dataSource.connect(mockCollectionViewer as any).subscribe((result) => {
        expect(result.length).toBe(maxRenderItemCount);
        done();
      });
    });

    it('should update when observable emits new data', (done) => {
      const dataSubject = new BehaviorSubject(createTestData(10));
      const dataSource = new VirtualizedDataSource(dataSubject);
      const mockCollectionViewer = { viewChange: of({ start: 0, end: 10 }) };

      let emissionCount = 0;
      dataSource.connect(mockCollectionViewer as any).subscribe((result) => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(result.length).toBe(10);
          dataSubject.next(createTestData(20));
        } else if (emissionCount === 2) {
          expect(result.length).toBe(20);
          done();
        }
      });
    });
  });

  describe('pagination', () => {
    it('should load next page', () => {
      const data = createTestData(200);
      const maxRenderItemCount = 100;
      const pageSize = 50;
      const dataSource = new VirtualizedDataSource(data, maxRenderItemCount, pageSize);
      const mockCollectionViewer = { viewChange: of({ start: 0, end: 10 }) };

      dataSource.connect(mockCollectionViewer as any).subscribe();

      const hasMore = dataSource.loadMoreData('next');
      expect(hasMore).toBe(false);
    });

    it('should indicate when no more data to load next', () => {
      const data = createTestData(200);
      const maxRenderItemCount = 100;
      const pageSize = 50;
      const dataSource = new VirtualizedDataSource(data, maxRenderItemCount, pageSize);
      const mockCollectionViewer = { viewChange: of({ start: 0, end: 10 }) };

      dataSource.connect(mockCollectionViewer as any).subscribe();

      const hasMore1 = dataSource.loadMoreData('next');
      expect(hasMore1).toBe(false);

      const hasMore2 = dataSource.loadMoreData('next');
      expect(hasMore2).toBe(false);

      const noMoreData = dataSource.loadMoreData('next');
      expect(noMoreData).toBe(true);
    });

    it('should load previous page', () => {
      const data = createTestData(200);
      const maxRenderItemCount = 100;
      const pageSize = 50;
      const dataSource = new VirtualizedDataSource(data, maxRenderItemCount, pageSize);
      const mockCollectionViewer = { viewChange: of({ start: 0, end: 10 }) };

      dataSource.connect(mockCollectionViewer as any).subscribe();
      dataSource.loadMoreData('next');
      dataSource.loadMoreData('next');

      const hasMore = dataSource.loadMoreData('previous');
      expect(hasMore).toBe(false);
    });

    it('should indicate when no more data to load previous', () => {
      const data = createTestData(100);
      const maxRenderItemCount = 50;
      const pageSize = 25;
      const dataSource = new VirtualizedDataSource(data, maxRenderItemCount, pageSize);
      const mockCollectionViewer = { viewChange: of({ start: 0, end: 10 }) };

      dataSource.connect(mockCollectionViewer as any).subscribe();

      const noMoreData = dataSource.loadMoreData('previous');
      expect(noMoreData).toBe(true);
    });
  });

  describe('updates observable', () => {
    it('should emit updates with removedCount', (done) => {
      const data = createTestData(200);
      const maxRenderItemCount = 100;
      const pageSize = 50;
      const dataSource = new VirtualizedDataSource(data, maxRenderItemCount, pageSize);

      dataSource.updates$.subscribe((update) => {
        expect(update.data).toBeTruthy();
        expect(typeof update.removedCount).toBe('number');
        done();
      });

      const mockCollectionViewer = { viewChange: of({ start: 0, end: 10 }) };
      dataSource.connect(mockCollectionViewer as any).subscribe();
    });
  });

  describe('disconnect', () => {
    it('should complete observables on disconnect', () => {
      const data = createTestData(50);
      const dataSource = new VirtualizedDataSource(data);
      const mockCollectionViewer = { viewChange: of({ start: 0, end: 10 }) };

      let completed = false;
      dataSource.connect(mockCollectionViewer as any).subscribe({
        complete: () => {
          completed = true;
        },
      });

      dataSource.disconnect(mockCollectionViewer as any);
      expect(completed).toBe(true);
    });
  });
});
