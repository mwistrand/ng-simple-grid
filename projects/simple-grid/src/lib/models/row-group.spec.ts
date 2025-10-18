import { RowGroup, GroupedData } from './row-group';

describe('RowGroup', () => {
  it('should define RowGroup interface', () => {
    const rowGroup: RowGroup<any> = {
      groupKey: 'key1',
      groupPath: ['path1', 'path2'],
      groupName: 'Group 1',
      items: [{ id: 1 }, { id: 2 }],
      startIndex: 0,
      endIndex: 1,
    };
    expect(rowGroup).toBeTruthy();
    expect(rowGroup.groupKey).toBe('key1');
    expect(rowGroup.groupPath).toEqual(['path1', 'path2']);
    expect(rowGroup.items.length).toBe(2);
  });

  it('should define GroupedData interface', () => {
    const rowGroup: RowGroup<any> = {
      groupKey: 'key1',
      groupPath: ['path1'],
      groupName: 'Group 1',
      items: [{ id: 1 }],
      startIndex: 0,
      endIndex: 0,
    };

    const groupedData: GroupedData<any> = {
      groups: [rowGroup],
      flatData: [{ id: 1 }],
      groupMap: new Map([[{ id: 1 }, rowGroup]]),
    };

    expect(groupedData).toBeTruthy();
    expect(groupedData.groups.length).toBe(1);
    expect(groupedData.flatData.length).toBe(1);
  });
});
