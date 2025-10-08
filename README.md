# NgSimpleGrid

An Angular table component library built on Angular CDK, featuring infinite scroll and virtualized rendering capabilities.

## Features

- **Infinite Scroll**: Automatically load data as users scroll through the table
- **Virtualized Rendering**: Efficiently render large datasets by limiting rendered items
- **Bidirectional Loading**: Support for loading data both upward and downward
- **CDK-Based**: Built on Angular CDK Table for robust table functionality
- **Customizable Thresholds**: Configure when to trigger data loading based on scroll position

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

## Development

To start a local development server with the demo:

```bash
npm start
```

Navigate to `http://localhost:4200/` to see the demo application.

## Building

To build the library:

```bash
ng build simple-grid
```

The build artifacts will be stored in the `dist/` directory.

## Running Tests

To execute unit tests:

```bash
ng test
```

## Additional Resources

For more information on using the Angular CLI, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
