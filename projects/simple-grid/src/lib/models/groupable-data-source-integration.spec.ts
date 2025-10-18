import { TestBed } from '@angular/core/testing';
import { GroupableDataSource, SortState } from './groupable-data-source';
import { SgTableGroupingConfig } from './grouping-config';
import { take, filter } from 'rxjs/operators';

interface TestUser {
  id: number;
  name: string;
  department: string;
  team: string;
  age: number;
}

describe('GroupableDataSource Integration', () => {
  let dataSource: GroupableDataSource<TestUser>;
  let testData: TestUser[];

  beforeEach(() => {
    testData = [
      { id: 1, name: 'Alice', department: 'Engineering', team: 'Frontend', age: 28 },
      { id: 2, name: 'Bob', department: 'Engineering', team: 'Backend', age: 32 },
      { id: 3, name: 'Charlie', department: 'Sales', team: 'East', age: 45 },
      { id: 4, name: 'Diana', department: 'Engineering', team: 'Frontend', age: 26 },
      { id: 5, name: 'Eve', department: 'Sales', team: 'West', age: 38 },
    ];
  });

  describe('groupBy property name', () => {
    it('should group by single property', (done) => {
      const config: SgTableGroupingConfig<TestUser> = {
        enabled: true,
        groupBy: 'department',
      };
      dataSource = new GroupableDataSource(config);
      dataSource.setData(testData);

      // Subscribe to groupedData$ and filter out null
      dataSource.groupedData$
        .pipe(
          filter((data) => data !== null),
          take(1),
        )
        .subscribe((groupedData) => {
          expect(groupedData).toBeTruthy();
          expect(groupedData!.groups.length).toBe(2);

          const engineeringGroup = groupedData!.groups.find((g) => g.groupName === 'Engineering');
          const salesGroup = groupedData!.groups.find((g) => g.groupName === 'Sales');

          expect(engineeringGroup).toBeTruthy();
          expect(engineeringGroup!.items.length).toBe(3);
          expect(salesGroup).toBeTruthy();
          expect(salesGroup!.items.length).toBe(2);

          done();
        });

      // Subscribe to connect to trigger data processing
      dataSource.connect().pipe(take(1)).subscribe();
    });

    it('should group by multiple properties', (done) => {
      const config: SgTableGroupingConfig<TestUser> = {
        enabled: true,
        groupBy: ['department', 'team'],
      };
      dataSource = new GroupableDataSource(config);
      dataSource.setData(testData);

      dataSource.groupedData$
        .pipe(
          filter((data) => data !== null),
          take(1),
        )
        .subscribe((groupedData) => {
          expect(groupedData).toBeTruthy();
          // Engineering-Frontend, Engineering-Backend, Sales-East, Sales-West
          expect(groupedData!.groups.length).toBe(4);

          const frontendGroup = groupedData!.groups.find(
            (g) => g.groupKey === 'Engineering|Frontend',
          );
          expect(frontendGroup).toBeTruthy();
          expect(frontendGroup!.items.length).toBe(2);

          done();
        });

      dataSource.connect().pipe(take(1)).subscribe();
    });
  });

  describe('groupBy function', () => {
    it('should group by custom function returning string', (done) => {
      const config: SgTableGroupingConfig<TestUser> = {
        enabled: true,
        groupBy: (user) => (user.age < 30 ? 'Young' : 'Experienced'),
      };
      dataSource = new GroupableDataSource(config);
      dataSource.setData(testData);

      dataSource.groupedData$
        .pipe(
          filter((data) => data !== null),
          take(1),
        )
        .subscribe((groupedData) => {
          expect(groupedData).toBeTruthy();
          expect(groupedData!.groups.length).toBe(2);

          const youngGroup = groupedData!.groups.find((g) => g.groupName === 'Young');
          const experiencedGroup = groupedData!.groups.find((g) => g.groupName === 'Experienced');

          expect(youngGroup).toBeTruthy();
          expect(youngGroup!.items.length).toBe(2);
          expect(experiencedGroup).toBeTruthy();
          expect(experiencedGroup!.items.length).toBe(3);

          done();
        });

      dataSource.connect().pipe(take(1)).subscribe();
    });

    it('should group by custom function returning array', (done) => {
      const config: SgTableGroupingConfig<TestUser> = {
        enabled: true,
        groupBy: (user) => [user.department, user.team],
      };
      dataSource = new GroupableDataSource(config);
      dataSource.setData(testData);

      dataSource.groupedData$
        .pipe(
          filter((data) => data !== null),
          take(1),
        )
        .subscribe((groupedData) => {
          expect(groupedData).toBeTruthy();
          expect(groupedData!.groups.length).toBe(4);

          const frontendGroup = groupedData!.groups.find(
            (g) => g.groupPath[0] === 'Engineering' && g.groupPath[1] === 'Frontend',
          );
          expect(frontendGroup).toBeTruthy();
          expect(frontendGroup!.groupPath).toEqual(['Engineering', 'Frontend']);

          done();
        });

      dataSource.connect().pipe(take(1)).subscribe();
    });
  });

  describe('user groups', () => {
    it('should support user-created groups', (done) => {
      const config: SgTableGroupingConfig<TestUser> = {
        enabled: true,
        groupBy: 'department',
      };
      dataSource = new GroupableDataSource(config);
      dataSource.setData(testData);

      // Add a user group
      const alice = testData[0];
      const bob = testData[1];
      dataSource.addUserGroup('Special Team', [alice, bob]);

      dataSource.groupedData$
        .pipe(
          filter((data) => data !== null),
          take(1),
        )
        .subscribe((groupedData) => {
          expect(groupedData).toBeTruthy();

          const specialGroup = groupedData!.groups.find((g) => g.groupPath[0] === 'Special Team');
          expect(specialGroup).toBeTruthy();
          expect(specialGroup!.items).toContain(alice);
          expect(specialGroup!.items).toContain(bob);

          done();
        });

      dataSource.connect().pipe(take(1)).subscribe();
    });
  });

  describe('sorting within groups', () => {
    it('should sort within groups when sortWithinGroups is true', (done) => {
      const config: SgTableGroupingConfig<TestUser> = {
        enabled: true,
        groupBy: 'department',
        sortWithinGroups: true,
      };
      dataSource = new GroupableDataSource(config);
      dataSource.setData(testData);

      const sortState: SortState = {
        active: 'name',
        direction: 'asc',
      };
      dataSource.setSort(sortState);

      dataSource.groupedData$
        .pipe(
          filter((data) => data !== null),
          take(1),
        )
        .subscribe((groupedData) => {
          expect(groupedData).toBeTruthy();

          const engineeringGroup = groupedData!.groups.find((g) => g.groupName === 'Engineering');
          expect(engineeringGroup).toBeTruthy();

          // Should be sorted by name: Alice, Bob, Diana
          expect(engineeringGroup!.items[0].name).toBe('Alice');
          expect(engineeringGroup!.items[1].name).toBe('Bob');
          expect(engineeringGroup!.items[2].name).toBe('Diana');

          done();
        });

      dataSource.connect().pipe(take(1)).subscribe();
    });
  });

  describe('getGroupForItem', () => {
    it('should return the correct group for an item', (done) => {
      const config: SgTableGroupingConfig<TestUser> = {
        enabled: true,
        groupBy: 'department',
      };
      dataSource = new GroupableDataSource(config);
      dataSource.setData(testData);

      dataSource
        .connect()
        .pipe(take(1))
        .subscribe(() => {
          // Wait a bit for groupedData to be set
          setTimeout(() => {
            const alice = testData[0];
            const group = dataSource.getGroupForItem(alice);

            expect(group).toBeTruthy();
            expect(group!.groupName).toBe('Engineering');
            expect(group!.items).toContain(alice);

            done();
          }, 100);
        });
    });
  });

  describe('flat data output', () => {
    it('should maintain correct order in flat data', (done) => {
      const config: SgTableGroupingConfig<TestUser> = {
        enabled: true,
        groupBy: 'department',
      };
      dataSource = new GroupableDataSource(config);
      dataSource.setData(testData);

      dataSource
        .connect()
        .pipe(take(1))
        .subscribe((flatData) => {
          expect(flatData.length).toBe(5);

          // All Engineering items should be together
          const engineeringItems = flatData.filter((u) => u.department === 'Engineering');
          const firstEngIndex = flatData.indexOf(engineeringItems[0]);
          const lastEngIndex = flatData.indexOf(engineeringItems[engineeringItems.length - 1]);

          expect(lastEngIndex - firstEngIndex).toBe(engineeringItems.length - 1);

          done();
        });
    });
  });
});
