import { GroupableDataSource, SortState } from './groupable-data-source';
import { SgTableGroupingConfig } from './grouping-config';

interface TestData {
  id: number;
  name: string;
  category: string;
}

describe('GroupableDataSource', () => {
  let dataSource: GroupableDataSource<TestData>;
  let config: SgTableGroupingConfig<TestData>;

  const testData: TestData[] = [
    { id: 1, name: 'Item 1', category: 'A' },
    { id: 2, name: 'Item 2', category: 'B' },
    { id: 3, name: 'Item 3', category: 'A' },
    { id: 4, name: 'Item 4', category: 'B' },
  ];

  beforeEach(() => {
    config = { enabled: true };
    dataSource = new GroupableDataSource(config);
  });

  afterEach(() => {
    dataSource.disconnect();
  });

  it('should create', () => {
    expect(dataSource).toBeTruthy();
  });

  it('should emit data when setData is called', (done) => {
    let emissionCount = 0;
    dataSource.connect().subscribe((data) => {
      emissionCount++;
      if (emissionCount === 2) {
        expect(data).toEqual(testData);
        done();
      }
    });

    dataSource.setData(testData);
  });

  it('should group data by property', (done) => {
    config.groupBy = 'category';
    dataSource = new GroupableDataSource(config);

    let emissionCount = 0;
    dataSource.connect().subscribe((data) => {
      emissionCount++;
      if (emissionCount === 2) {
        expect(data.length).toBe(4);
        done();
      }
    });

    dataSource.setData(testData);
  });

  it('should group data by function', (done) => {
    config.groupBy = (item) => item.category;
    dataSource = new GroupableDataSource(config);

    let emissionCount = 0;
    dataSource.connect().subscribe((data) => {
      emissionCount++;
      if (emissionCount === 2) {
        expect(data.length).toBe(4);
        done();
      }
    });

    dataSource.setData(testData);
  });

  it('should add user-defined groups', (done) => {
    const itemsToGroup = [testData[0], testData[1]];

    let emissionCount = 0;
    dataSource.connect().subscribe((data) => {
      emissionCount++;
      if (emissionCount === 3) {
        expect(data.length).toBe(4);
        done();
      }
    });

    dataSource.setData(testData);
    dataSource.addUserGroup('Custom Group', itemsToGroup);
  });

  it('should sort data when sort state is provided', (done) => {
    const sortState: SortState = { active: 'name', direction: 'asc' };

    let emissionCount = 0;
    dataSource.connect().subscribe((data) => {
      emissionCount++;
      if (emissionCount === 3 && data.length > 0) {
        expect(data[0].name).toBe('Item 1');
        expect(data[3].name).toBe('Item 4');
        done();
      }
    });

    dataSource.setData(testData);
    dataSource.setSort(sortState);
  });

  it('should sort data in descending order', (done) => {
    const sortState: SortState = { active: 'name', direction: 'desc' };

    let emissionCount = 0;
    dataSource.connect().subscribe((data) => {
      emissionCount++;
      if (emissionCount === 3 && data.length > 0) {
        expect(data[0].name).toBe('Item 4');
        expect(data[3].name).toBe('Item 1');
        done();
      }
    });

    dataSource.setData(testData);
    dataSource.setSort(sortState);
  });

  it('should return empty array when no data is provided', (done) => {
    let emissionCount = 0;
    dataSource.connect().subscribe((data) => {
      emissionCount++;
      if (emissionCount === 2) {
        expect(data).toEqual([]);
        done();
      }
    });

    dataSource.setData([]);
  });
});
