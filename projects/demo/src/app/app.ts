import { Component, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  ColumnOrderUpdate,
  SgTableLoadingDirection,
  SgTableLoadingState,
  SgTableModule,
} from 'simple-grid';
import type { ColumnWidthUpdate } from 'simple-grid';
import { CommonModule } from '@angular/common';

interface User {
  id: number;
  name: string;
  email: string;
}

class UserDataSource extends DataSource<User> {
  private dataSubject = new BehaviorSubject<User[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private page = -1;

  readonly loading$ = this.loadingSubject.asObservable();

  connect(): Observable<User[]> {
    return this.dataSubject.asObservable();
  }

  disconnect(): void {
    this.dataSubject.complete();
  }

  loadData(direction: SgTableLoadingDirection): void {
    if (direction === 'next') {
      this.page += 1;
      this.loadPage();
    }
  }

  private loadPage(): void {
    this.loadingSubject.next(true);
    const currentData = this.dataSubject.value;
    setTimeout(() => {
      const start = this.page * 50;
      const users: User[] = Array.from({ length: 50 }, (_, i) => ({
        id: start + i + 1,
        name: `User ${start + i + 1}`,
        email: `user${start + i + 1}@example.com`,
      }));

      this.dataSubject.next([...currentData, ...users]);
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
  protected readonly dataSource = new UserDataSource();
  protected displayedColumns = ['id', 'name', 'email'];

  ngOnInit() {
    this.dataSource.loadData('next');
  }

  onLoadingStateChange(state: SgTableLoadingState): void {
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
