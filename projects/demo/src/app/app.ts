import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  ColumnOrderUpdate,
  SgTableLoadingDirection,
  SgTableLoadingState,
  SgTableModule,
  SgTableComponent,
  GroupConfig,
} from 'simple-grid';
import type { ColumnWidthUpdate } from 'simple-grid';
import { CommonModule } from '@angular/common';

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
}

class UserDataSource extends DataSource<User> {
  private dataSubject = new BehaviorSubject<User[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private page = -1;
  private readonly maxItems = 1000; // CAP AT 1000
  private readonly departments = ['Engineering', 'Marketing', 'Sales', 'Support', 'HR', 'Finance'];
  private sortByDepartment = false;
  private resetting = false;

  readonly loading$ = this.loadingSubject.asObservable();

  connect(): Observable<User[]> {
    return this.dataSubject.asObservable();
  }

  disconnect(): void {
    this.dataSubject.complete();
  }

  setSortByDepartment(sort: boolean): void {
    this.resetting = true;
    this.sortByDepartment = sort;
    this.page = -1;
    this.dataSubject.next([]); // Reset data
    this.loadData('next'); // Load first page in new mode
  }

  loadData(direction: SgTableLoadingDirection): void {
    if (direction === 'next') {
      this.page += 1;
      this.loadPage();
    }
  }

  private sortUsers(users: User[]): User[] {
    if (this.sortByDepartment) {
      return users.sort((a, b) => {
        const deptCompare = a.department.localeCompare(b.department);
        if (deptCompare !== 0) return deptCompare;
        return a.id - b.id;
      });
    }
    return users.sort((a, b) => a.id - b.id);
  }

  private loadPage(): void {
    const currentData = this.dataSubject.value;

    // Don't load more if we've hit the cap
    if (currentData.length >= this.maxItems) {
      return;
    }

    this.loadingSubject.next(true);
    setTimeout(() => {
      const start = this.page * 50;
      const pageSize = 50;

      // Calculate how many items we can add without exceeding cap
      const remainingSlots = this.maxItems - currentData.length;
      const itemsToAdd = Math.min(pageSize, remainingSlots);

      let users: User[] = [];
      if (this.sortByDepartment) {
        // Deterministic, even department distribution
        const depts = this.departments;
        const perDept = Math.floor(this.maxItems / depts.length);
        const extra = this.maxItems % depts.length;
        // Compute department blocks
        let deptBlocks: { dept: string; start: number; end: number }[] = [];
        let running = 1;
        for (let i = 0; i < depts.length; i++) {
          const count = perDept + (i < extra ? 1 : 0);
          deptBlocks.push({ dept: depts[i], start: running, end: running + count - 1 });
          running += count;
        }
        for (let i = 0; i < itemsToAdd; i++) {
          const id = start + i + 1;
          // Find which department this id belongs to
          const block = deptBlocks.find((b) => id >= b.start && id <= b.end);
          users.push({
            id,
            name: `User ${id}`,
            email: `user${id}@example.com`,
            department: block ? block.dept : depts[0],
          });
        }
      } else {
        // Random department assignment
        users = Array.from({ length: itemsToAdd }, (_, i) => {
          const id = start + i + 1;
          const deptIndex = Math.floor(Math.random() * this.departments.length);
          return {
            id,
            name: `User ${id}`,
            email: `user${id}@example.com`,
            department: this.departments[deptIndex],
          };
        });
      }

      const allUsers = this.sortUsers([...currentData, ...users]);

      this.dataSubject.next(allUsers);
      this.loadingSubject.next(false);
    }, 300);
  }
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, SgTableModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent implements OnInit {
  @ViewChild('table', { read: SgTableComponent })
  table?: SgTableComponent<User>;

  #resetting = false;

  protected readonly dataSource = new UserDataSource();
  protected displayedColumns = ['id', 'name', 'email', 'department'];

  // Grouping state
  protected groupingEnabled = false;
  protected currentGroupConfig: GroupConfig<User> | null = null;

  ngOnInit() {
    this.dataSource.loadData('next');
  }

  /**
   * Toggle grouping on/off
   */
  protected toggleGrouping(): void {
    this.#resetting = true;
    this.groupingEnabled = !this.groupingEnabled;

    if (this.groupingEnabled) {
      // Enable grouping by setting groupConfig
      this.currentGroupConfig = {
        groupBy: 'department',
        initialCollapsed: false,
      };
      // Sort data by department for grouping
      this.dataSource.setSortByDepartment(true);
    } else {
      // Disable grouping by setting groupConfig to null
      this.currentGroupConfig = null;
      // Reset to default sort by ID
      this.dataSource.setSortByDepartment(false);
    }
  }

  /**
   * Get formatted group label
   */
  protected getGroupLabel(groupValue: string | number, count: number): string {
    return `${groupValue} Department (${count} employees)`;
  }

  onLoadingStateChange(state: SgTableLoadingState): void {
    if (this.#resetting) {
      this.#resetting = false;
      return;
    }
    this.dataSource.loadData(state.requesting);
  }

  onUpdateColumnOrder({ from, to }: ColumnOrderUpdate) {
    const displayedColumns = [...this.displayedColumns];
    const [removed] = displayedColumns.splice(from, 1);
    displayedColumns.splice(to, 0, removed);
    this.displayedColumns = displayedColumns;
  }

  onUpdateColumnWidth(update: ColumnWidthUpdate) {
    console.log(
      `Column ${update.columnId} resized from ${update.previousWidth}px to ${update.width}px`,
    );
    // Optionally persist to localStorage, backend, etc.
  }

  trackById(index: number, user: User): number {
    return user.id;
  }
}
