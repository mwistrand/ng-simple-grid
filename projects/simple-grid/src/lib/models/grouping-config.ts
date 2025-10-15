import { ComponentType } from '@angular/cdk/portal';

export interface SgTableGroupingConfig<T = any> {
  /**
   * Enables the entire row selection and grouping feature.
   * @default false
   */
  enabled?: boolean;

  /**
   * Defines programmatic grouping. Can be a property name, an array of property
   * names, or a function that returns a group name string (or array of strings)
   * for a given data item.
   */
  groupBy?: keyof T | (keyof T)[] | ((data: T) => string | string[]);

  /**
   * When true (default), sorting is applied within each group.
   * When false, grouping is ignored when a column sort is active.
   * @default true
   */
  sortWithinGroups?: boolean;

  /**
   * An optional custom component to use for the grouping dialog.
   * This component will receive data and must emit grouping events.
   */
  customGroupDialog?: ComponentType<any>;
}

export interface RowsGroupedEvent<T = any> {
  groupName: string;
  models: T[];
}
