# NgSimpleGrid

An Angular table component library built on Angular CDK, featuring infinite scroll and virtualized rendering capabilities.

## Features

- **Infinite Scroll**: Automatically load data as users scroll through the table
- **Virtualized Rendering**: Efficiently render large datasets by limiting rendered items
- **Bidirectional Loading**: Support for loading data both upward and downward
- **Drag and Drop Columns**: Reorder table columns with mouse, touch, and keyboard support
- **Row Grouping**: Select and group rows with programmatic and user-defined grouping support
- **CDK-Based**: Built on Angular CDK Table for robust table functionality
- **Customizable Thresholds**: Configure when to trigger data loading based on scroll position
- **Accessibility**: Full WCAG 2.2 compliance with keyboard and screen reader support
- **Sorting and Pagination**: Full support for standard Angular CDK table features

## Installation

```bash
npm install simple-grid
```

## Usage

### Basic Setup

Import the `SgTableModule` in your component:

```typescript
import { Component, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';
import { SgTableLoadingDirection, SgTableLoadingState, SgTableModule } from 'simple-grid';

interface User {
  id: number;
  name: string;
  email: string;
}

class UserDataSource extends DataSource<User> {
  private dataSubject = new BehaviorSubject<User[]>([]);

  connect(): Observable<User[]> {
    return this.dataSubject.asObservable();
  }

  disconnect(): void {
    this.dataSubject.complete();
  }

  loadData(direction: SgTableLoadingDirection): void {
    // Implement your data loading logic
  }
}

@Component({
  selector: 'app-root',
  imports: [SgTableModule],
  template: `...`
})
export class AppComponent implements OnInit {
  readonly displayedColumns = ['id', 'name', 'email'];
  readonly dataSource = new UserDataSource();

  ngOnInit() {
    this.dataSource.loadData('next');
  }

  onLoadingStateChange(state: SgTableLoadingState): void {
    this.dataSource.loadData(state.requesting);
  }

  trackById(index: number, user: User): number {
    return user.id;
  }
}
```

### Template

```html
<sg-table-scroll
  [dataSource]="dataSource"
  [trackBy]="trackById"
  [batchSize]="50"
  [maxRenderItemCount]="100"
  [loadThresholdPercentBottom]="40"
  [loadThresholdPercentTop]="40"
  (loadingState)="onLoadingStateChange($event)">

  <table sg-table>
    <!-- Column Definitions -->
    <ng-container sgColumnDef="id">
      <th sg-header-cell *sgHeaderCellDef>ID</th>
      <td sg-cell *sgCellDef="let user">{{ user.id }}</td>
    </ng-container>

    <ng-container sgColumnDef="name">
      <th sg-header-cell *sgHeaderCellDef>Name</th>
      <td sg-cell *sgCellDef="let user">{{ user.name }}</td>
    </ng-container>

    <ng-container sgColumnDef="email">
      <th sg-header-cell *sgHeaderCellDef>Email</th>
      <td sg-cell *sgCellDef="let user">{{ user.email }}</td>
    </ng-container>

    <!-- Header and Row Declarations -->
    <tr sg-header-row *sgHeaderRowDef="displayedColumns"></tr>
    <tr sg-row *sgRowDef="let row; columns: displayedColumns"></tr>
  </table>
</sg-table-scroll>
```

## Components

### sg-table-scroll

The scroll container component that handles infinite scroll and virtualization.

**Inputs:**
- `dataSource` - The CDK data source for the table
- `trackBy` (required) - TrackBy function for efficient row rendering
- `batchSize` - Number of items to load per batch (default: 50)
- `maxRenderItemCount` - Maximum number of items to render at once
- `loadThresholdPercentTop` - Percentage of viewport to trigger loading when scrolling up (default: 20)
- `loadThresholdPercentBottom` - Percentage of viewport to trigger loading when scrolling down (default: 20)

**Outputs:**
- `loadingState` - Emits loading state changes with direction ('next' or 'previous')

### sg-table

The table component built on Angular CDK Table. Use as the selector `table[sg-table]` or `sg-table`.

This component extends `CdkTable` and provides the same functionality with additional features for working with the scroll container.

**Inputs:**
- `dnd` - Enable drag and drop for column reordering (default: false)
- `groupingConfig` - Configuration object for row grouping feature

**Outputs:**
- `updateColumnOrder` - Emits when columns are reordered via drag and drop
- `selectionChanged` - Emits the complete list of currently selected row data models
- `rowsGrouped` - Emits when user confirms grouping rows via the dialog

## Drag and Drop Column Reordering

NgSimpleGrid supports comprehensive drag-and-drop functionality for reordering table columns with full accessibility support including mouse, touch, and keyboard interactions.

### Enabling Drag and Drop

To enable drag-and-drop column reordering, add the `[dnd]="true"` input to the table element:

```html
<sg-table-scroll
  [dataSource]="dataSource"
  [trackBy]="trackById">

  <table sg-table [dnd]="true" (updateColumnOrder)="onColumnReorder($event)">
    <!-- Column definitions -->
    <ng-container sgColumnDef="id">
      <th sg-header-cell *sgHeaderCellDef>ID</th>
      <td sg-cell *sgCellDef="let user">{{ user.id }}</td>
    </ng-container>

    <ng-container sgColumnDef="name">
      <th sg-header-cell *sgHeaderCellDef>Name</th>
      <td sg-cell *sgCellDef="let user">{{ user.name }}</td>
    </ng-container>

    <ng-container sgColumnDef="email">
      <th sg-header-cell *sgHeaderCellDef>Email</th>
      <td sg-cell *sgCellDef="let user">{{ user.email }}</td>
    </ng-container>

    <!-- Header and Row Declarations -->
    <tr sg-header-row *sgHeaderRowDef="displayedColumns()"></tr>
    <tr sg-row *sgRowDef="let row; columns: displayedColumns()"></tr>
  </table>
</sg-table-scroll>
```

### Handling Column Reorder Events

The `updateColumnOrder` event emits information about the column reordering operation:

```typescript
import { Component, signal } from '@angular/core';
import { ColumnOrderUpdate } from 'simple-grid';

@Component({
  selector: 'app-root',
  imports: [SgTableModule],
  template: `...`
})
export class AppComponent {
  displayedColumns = signal(['id', 'name', 'email']);

  onColumnReorder(event: ColumnOrderUpdate): void {
    const columns = [...this.displayedColumns()];
    const [movedColumn] = columns.splice(event.from, 1);

    // Calculate the insertion index based on the drop position
    let insertIndex = event.to;
    if (event.position === 'after') {
      insertIndex++;
    }
    if (event.from < insertIndex) {
      insertIndex--;
    }

    columns.splice(insertIndex, 0, movedColumn);
    this.displayedColumns.set(columns);
  }
}
```

The `ColumnOrderUpdate` interface contains:
- `from: number` - The index of the column being moved
- `to: number` - The index of the target column
- `position: 'before' | 'after' | null` - Where to insert relative to the target column

### Disabling Drag and Drop for Specific Columns

You can disable drag-and-drop for individual columns using the `[draggable]` input on header cells:

```html
<ng-container sgColumnDef="id">
  <th sg-header-cell *sgHeaderCellDef [draggable]="false">ID</th>
  <td sg-cell *sgCellDef="let user">{{ user.id }}</td>
</ng-container>

<ng-container sgColumnDef="name">
  <th sg-header-cell *sgHeaderCellDef>Name</th>
  <td sg-cell *sgCellDef="let user">{{ user.name }}</td>
</ng-container>

<ng-container sgColumnDef="actions">
  <th sg-header-cell *sgHeaderCellDef [draggable]="false">Actions</th>
  <td sg-cell *sgCellDef="let user">
    <button>Edit</button>
  </td>
</ng-container>
```

In this example, the "ID" and "Actions" columns cannot be dragged or used as drop targets, while the "Name" column remains draggable.

### Accessibility Features

The drag-and-drop functionality is fully accessible:

#### Mouse Users
- Drag header cells to reorder columns
- Visual feedback with dotted borders on drop targets
- Cursor changes to 'move' when hovering over draggable headers

#### Touch Users
- Touch and drag header cells on mobile devices
- Same visual feedback as mouse interactions
- Optimized for touch screens with proper touch event handling

#### Keyboard Users
- Press **Tab** to navigate to column headers
- Use **Shift + Arrow Left** to move a column to the left
- Use **Shift + Arrow Right** to move a column to the right
- ARIA attributes (`aria-grabbed`, `role="button"`) for screen readers

#### Screen Readers
- Column headers announce as buttons when draggable
- `aria-grabbed` attribute indicates drag state
- Clear focus management during keyboard reordering

### Styling Drag and Drop

The drag-and-drop functionality includes default styles that can be customized:

```css
/* Dragged column visual feedback */
.sg-header-cell[draggable="true"] {
  cursor: move;
  user-select: none;
}

/* Drop target indicator */
.sg-header-cell.is-drop-candidate {
  outline: 2px dotted #000;
  outline-offset: -2px;
}

/* Column being dragged (automatically applied) */
.sg-header-cell[aria-grabbed="true"] {
  opacity: 0.5;
}
```

You can override these styles in your application's CSS to match your design system.

## Row Grouping

NgSimpleGrid provides a comprehensive row grouping feature that allows users to select multiple rows and organize them into custom groups. This feature includes both programmatic grouping based on data properties and user-defined grouping through an interactive dialog.

### Enabling Row Grouping

To enable the row grouping feature, provide a `groupingConfig` object to the table component:

```typescript
import { Component, signal } from '@angular/core';
import { SgTableGroupingConfig, SgTableModule, GroupableDataSource } from 'simple-grid';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

@Component({
  selector: 'app-products',
  imports: [SgTableModule],
  template: `...`
})
export class ProductsComponent {
  groupingConfig = signal<SgTableGroupingConfig<Product>>({
    enabled: true,
    groupBy: 'category',
    sortWithinGroups: true
  });

  onSelectionChanged(selectedItems: Product[]): void {
    console.log('Selected items:', selectedItems);
  }

  onRowsGrouped(event: { groupName: string; models: Product[] }): void {
    console.log(`Grouped ${event.models.length} items as "${event.groupName}"`);
    // Handle the grouped items as needed
  }
}
```

```html
<table sg-table 
  [dataSource]="dataSource" 
  [groupingConfig]="groupingConfig()"
  (selectionChanged)="onSelectionChanged($event)"
  (rowsGrouped)="onRowsGrouped($event)">
  
  <!-- Column definitions -->
  <ng-container sgColumnDef="name">
    <th sg-header-cell *sgHeaderCellDef>Name</th>
    <td sg-cell *sgCellDef="let product">{{ product.name }}</td>
  </ng-container>

  <ng-container sgColumnDef="category">
    <th sg-header-cell *sgHeaderCellDef>Category</th>
    <td sg-cell *sgCellDef="let product">{{ product.category }}</td>
  </ng-container>

  <ng-container sgColumnDef="price">
    <th sg-header-cell *sgHeaderCellDef>Price</th>
    <td sg-cell *sgCellDef="let product">{{ product.price | currency }}</td>
  </ng-container>

  <!-- Header and Row Declarations -->
  <tr sg-header-row *sgHeaderRowDef="displayedColumns"></tr>
  <tr sg-row *sgRowDef="let row; columns: displayedColumns"></tr>
</table>
```

### Grouping Configuration

The `SgTableGroupingConfig` interface provides the following options:

#### `enabled` (boolean)
Enables the entire row selection and grouping feature. When enabled, a checkbox column is automatically added as the first column of the table.

**Default:** `false`

#### `groupBy` (property name, array, or function)
Defines programmatic grouping. Can be:
- A property name: `'category'`
- An array of property names for hierarchical grouping: `['country', 'city']`
- A function that returns a group name or array of group names: `(item) => item.category`

When user-defined groups are created, they take precedence over programmatic grouping.

#### `sortWithinGroups` (boolean)
Controls sorting behavior when grouping is enabled:
- When `true` (default): Sorting is applied within each group, maintaining the group structure
- When `false`: Activating a sort flattens the display and sorts all rows as a single list

**Default:** `true`

#### `customGroupDialog` (ComponentType)
An optional custom component to use for the grouping dialog. The custom component must:
- Accept `GroupDialogData` via `DIALOG_DATA` injection token
- Emit a `GroupDialogResult` when the user confirms
- Handle focus management appropriately

### Using GroupableDataSource

For advanced grouping scenarios, use the `GroupableDataSource` class which integrates seamlessly with the table's grouping configuration:

```typescript
import { Component } from '@angular/core';
import { GroupableDataSource, SgTableGroupingConfig } from 'simple-grid';

@Component({
  selector: 'app-products',
  imports: [SgTableModule],
  template: `...`
})
export class ProductsComponent {
  groupingConfig: SgTableGroupingConfig<Product> = {
    enabled: true,
    groupBy: (item) => item.category,
    sortWithinGroups: true
  };

  dataSource = new GroupableDataSource<Product>(
    this.groupingConfig,
    (index, item) => item.id
  );

  ngOnInit() {
    // Load your data
    const products: Product[] = [...];
    this.dataSource.setData(products);
  }

  onRowsGrouped(event: { groupName: string; models: Product[] }): void {
    // Add the user-defined group to the data source
    this.dataSource.addUserGroup(event.groupName, event.models);
  }
}
```

### Row Selection Control

Individual rows can be marked as non-selectable using the `selectable` input on the row component:

```html
<tr sg-row 
  *sgRowDef="let row; columns: displayedColumns"
  [selectable]="row.canBeGrouped">
</tr>
```

A row is only selectable if both the table's `groupingConfig.enabled` is `true` and the row's `selectable` input is `true` (which is the default).

### User Interaction

When row grouping is enabled:

1. **Checkbox Column**: A checkbox column appears as the first column with:
   - Header checkbox: Select/deselect all selectable rows (supports indeterminate state)
   - Row checkboxes: Toggle individual row selection (disabled for non-selectable rows)

2. **Group Rows Button**: Appears in the header checkbox cell when two or more rows are selected
   - Opens a modal dialog for naming the group
   - Fully keyboard accessible with proper focus management

3. **Accessibility Announcements**: Screen reader users receive announcements for:
   - Number of selected rows
   - Appearance of the "Group Rows" button
   - Results of "select all" actions
   - Successful grouping operations

### Grouping Examples

#### Simple Property Grouping
```typescript
groupingConfig: SgTableGroupingConfig<Product> = {
  enabled: true,
  groupBy: 'category'
};
```

#### Hierarchical Grouping
```typescript
groupingConfig: SgTableGroupingConfig<Product> = {
  enabled: true,
  groupBy: ['country', 'city']
};
```

#### Function-Based Grouping
```typescript
groupingConfig: SgTableGroupingConfig<Product> = {
  enabled: true,
  groupBy: (product) => {
    if (product.price > 100) return 'Premium';
    if (product.price > 50) return 'Standard';
    return 'Budget';
  }
};
```

#### Sorting Within Groups
```typescript
groupingConfig: SgTableGroupingConfig<Product> = {
  enabled: true,
  groupBy: 'category',
  sortWithinGroups: true  // Sort within each category
};
```

### Styling Row Grouping

The row grouping feature includes default styles that can be customized:

```css
/* Table with grouping enabled */
.sg-table-grouping-enabled {
  /* Your styles */
}

/* Checkbox column cells */
.sg-table .sg-checkbox-column {
  width: 48px;
  text-align: center;
}

/* Selected rows */
.sg-table tr.sg-row-selected {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Group button */
.sg-table .sg-group-button {
  /* Your styles */
}
```



## Development

To start a local development server with the demo:

```bash
npm run start:lib
```

Navigate to `http://localhost:4200/` to see the demo application.

## Building

To build the library:

```bash
npm run build:lib
```

The build artifacts will be stored in the `dist/` directory.

## Running Tests

To execute unit tests:

```bash
npm run test:headless:single
```

## Additional Resources

For more information on using the Angular CLI, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
