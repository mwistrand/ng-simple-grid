# NgSimpleGrid

An Angular table component library built on Angular CDK, featuring infinite scroll and virtualized rendering capabilities.

## Features

- **Infinite Scroll**: Automatically load data as users scroll through the table
- **Virtualized Rendering**: Efficiently render large datasets by limiting rendered items
- **Bidirectional Loading**: Support for loading data both upward and downward
- **Drag and Drop Columns**: Reorder table columns with mouse, touch, and keyboard support
- **CDK-Based**: Built on Angular CDK Table for robust table functionality
- **Customizable Thresholds**: Configure when to trigger data loading based on scroll position
- **Accessibility**: Full WCAG 2.2 compliance with keyboard and screen reader support

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

**Outputs:**
- `updateColumnOrder` - Emits when columns are reordered via drag and drop

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
