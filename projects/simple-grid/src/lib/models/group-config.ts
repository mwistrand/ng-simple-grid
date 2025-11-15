/**
 * Configuration for row grouping.
 * Pass this to sg-table's groupConfig input to enable grouping.
 */
export interface GroupConfig<T> {
  /**
   * Field name or function to group by
   */
  groupBy: keyof T | ((item: T) => string | number);

  /**
   * Initial collapsed state for groups
   * @default false (all groups expanded)
   */
  initialCollapsed?: boolean;

  /**
   * Custom label formatter for group headers
   * If not provided, displays: "GroupValue (count items)"
   */
  groupLabel?: (groupValue: string | number, count: number) => string;
}

/**
 * Internal row type discriminator.
 * This type is used internally by the table - developers don't interact with it directly.
 */
export type GroupedRow<T> =
  | { type: 'data'; data: T; groupKey: string }
  | {
      type: 'group';
      groupKey: string;
      groupValue: string | number;
      count: number;
      isExpanded: boolean;
    };

/**
 * Type guard to check if a row is a group header
 */
export function isGroupRow<T>(row: T | GroupedRow<T>): row is GroupedRow<T> & { type: 'group' } {
  return typeof row === 'object' && row !== null && 'type' in row && row.type === 'group';
}

/**
 * Type guard to check if a row is a data row
 */
export function isDataRow<T>(row: T | GroupedRow<T>): row is GroupedRow<T> & { type: 'data' } {
  return typeof row === 'object' && row !== null && 'type' in row && row.type === 'data';
}

/**
 * Unwrap grouped row to get original data
 */
export function unwrapGroupedRow<T>(row: T | GroupedRow<T>): T {
  if (isDataRow(row)) {
    return row.data;
  }
  return row as T;
}

/**
 * Extract group key from row for trackBy
 */
export function getGroupedRowKey<T>(
  row: GroupedRow<T>,
  originalTrackBy?: (index: number, item: T) => any,
  index?: number,
): string | number {
  if (row.type === 'data') {
    // Use original trackBy if provided
    if (originalTrackBy && index !== undefined) {
      return `data-${originalTrackBy(index, row.data)}`;
    }
    return `data-${row.groupKey}`;
  }
  return `group-${row.groupKey}`;
}
