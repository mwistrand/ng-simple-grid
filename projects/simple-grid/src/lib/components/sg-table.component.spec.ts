import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { SgTableComponent, ColumnOrderUpdate } from './sg-table.component';
import { ColumnWidthUpdate } from '../models/column-width-config';
import { SgTableModule } from '../../sg-table.module';

@Component({
  template: `
    <table
      sg-table
      [dnd]="enableDnd()"
      [resizable]="enableResize()"
      (updateColumnOrder)="onColumnOrderUpdate($event)"
      (updateColumnWidth)="onColumnWidthUpdate($event)"
    >
      <ng-container sgColumnDef="username">
        <th sg-header-cell *sgHeaderCellDef [width]="200" [minWidth]="100" [maxWidth]="400">
          User name
        </th>
        <td sg-cell *sgCellDef="let row">{{ row.username }}</td>
      </ng-container>

      <!-- Age Definition -->
      <ng-container sgColumnDef="age">
        <th sg-header-cell *sgHeaderCellDef [width]="150" [minWidth]="80" [maxWidth]="300">Age</th>
        <td sg-cell *sgCellDef="let row">{{ row.age }}</td>
      </ng-container>

      <!-- Title Definition -->
      <ng-container sgColumnDef="title">
        <th sg-header-cell *sgHeaderCellDef [width]="250" [minWidth]="120" [maxWidth]="500">
          Title
        </th>
        <td sg-cell *sgCellDef="let row">{{ row.title }}</td>
      </ng-container>

      <!-- Header and Row Declarations -->
      <tr sg-header-row *sgHeaderRowDef="['username', 'age', 'title']"></tr>
      <tr sg-row *sgRowDef="let row; columns: ['username', 'age', 'title']"></tr>
    </table>
  `,
  imports: [SgTableModule],
})
class TestComponent {
  enableDnd = signal(false);
  enableResize = signal(false);
  lastColumnOrderUpdate: ColumnOrderUpdate | null = null;
  lastColumnWidthUpdate: ColumnWidthUpdate | null = null;

  onColumnOrderUpdate(update: ColumnOrderUpdate) {
    this.lastColumnOrderUpdate = update;
  }

  onColumnWidthUpdate(update: ColumnWidthUpdate) {
    this.lastColumnWidthUpdate = update;
  }
}

describe(SgTableComponent.name, () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let tableElement: HTMLTableElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tableElement = fixture.nativeElement.querySelector('table');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add sg-table class to host element', () => {
    expect(tableElement.classList.contains('sg-table')).toBe(true);
  });

  describe('Drag and Drop', () => {
    beforeEach(() => {
      component.enableDnd.set(true);
      fixture.detectChanges();
    });

    it('should make header cells draggable when dnd is enabled', () => {
      const headerCells = tableElement.querySelectorAll('th[sg-header-cell]');
      headerCells.forEach((cell) => {
        expect(cell.getAttribute('draggable')).toBe('true');
        expect(cell.getAttribute('role')).toBe('button');
        expect(cell.getAttribute('tabindex')).toBe('0');
      });
    });

    it('should not make header cells draggable when dnd is disabled', () => {
      component.enableDnd.set(false);
      fixture.detectChanges();

      const headerCells = tableElement.querySelectorAll('th[sg-header-cell]');
      headerCells.forEach((cell) => {
        expect(cell.getAttribute('draggable')).not.toBe('true');
      });
    });

    it('should emit updateColumnOrder event on drag and drop', () => {
      const headerCells = Array.from(
        tableElement.querySelectorAll('th[sg-header-cell]'),
      ) as HTMLElement[];

      // Simulate drag start on first column
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      });
      headerCells[0].dispatchEvent(dragStartEvent);

      // Simulate drag over second column
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        clientX: headerCells[1].getBoundingClientRect().right - 5,
      });
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: new DataTransfer(),
        writable: false,
      });
      headerCells[1].dispatchEvent(dragOverEvent);

      // Simulate drop on second column
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
      });
      headerCells[1].dispatchEvent(dropEvent);

      // Simulate drag end
      const dragEndEvent = new DragEvent('dragend', {
        bubbles: true,
      });
      headerCells[0].dispatchEvent(dragEndEvent);

      expect(component.lastColumnOrderUpdate).toBeTruthy();
      if (component.lastColumnOrderUpdate) {
        expect(component.lastColumnOrderUpdate.from).toBe(0);
        expect(component.lastColumnOrderUpdate.to).toBe(1);
      }
    });

    it('should set visual feedback during drag', () => {
      const headerCells = Array.from(
        tableElement.querySelectorAll('th[sg-header-cell]'),
      ) as HTMLElement[];

      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      });
      headerCells[0].dispatchEvent(dragStartEvent);

      expect(headerCells[0].style.opacity).toBe('0.5');
      expect(headerCells[0].getAttribute('aria-grabbed')).toBe('true');

      const dragEndEvent = new DragEvent('dragend', {
        bubbles: true,
      });
      headerCells[0].dispatchEvent(dragEndEvent);

      expect(headerCells[0].style.opacity).toBe('');
      expect(headerCells[0].getAttribute('aria-grabbed')).toBe('false');
    });

    it('should handle keyboard navigation with Shift+ArrowLeft', () => {
      const headerCells = Array.from(
        tableElement.querySelectorAll('th[sg-header-cell]'),
      ) as HTMLElement[];

      headerCells[1].focus();

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      headerCells[1].dispatchEvent(keyEvent);

      expect(component.lastColumnOrderUpdate).toBeTruthy();
      if (component.lastColumnOrderUpdate) {
        expect(component.lastColumnOrderUpdate.from).toBe(1);
        expect(component.lastColumnOrderUpdate.to).toBe(0);
        expect(component.lastColumnOrderUpdate.position).toBe('before');
      }
    });

    it('should handle keyboard navigation with Shift+ArrowRight', () => {
      const headerCells = Array.from(
        tableElement.querySelectorAll('th[sg-header-cell]'),
      ) as HTMLElement[];

      headerCells[1].focus();

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      headerCells[1].dispatchEvent(keyEvent);

      expect(component.lastColumnOrderUpdate).toBeTruthy();
      if (component.lastColumnOrderUpdate) {
        expect(component.lastColumnOrderUpdate.from).toBe(1);
        expect(component.lastColumnOrderUpdate.to).toBe(2);
        expect(component.lastColumnOrderUpdate.position).toBe('after');
      }
    });

    it('should not move column past the left boundary', () => {
      const headerCells = Array.from(
        tableElement.querySelectorAll('th[sg-header-cell]'),
      ) as HTMLElement[];

      headerCells[0].focus();
      component.lastColumnOrderUpdate = null;

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      headerCells[0].dispatchEvent(keyEvent);

      expect(component.lastColumnOrderUpdate).toBeNull();
    });

    it('should not move column past the right boundary', () => {
      const headerCells = Array.from(
        tableElement.querySelectorAll('th[sg-header-cell]'),
      ) as HTMLElement[];

      const lastIndex = headerCells.length - 1;
      headerCells[lastIndex].focus();
      component.lastColumnOrderUpdate = null;

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      headerCells[lastIndex].dispatchEvent(keyEvent);

      expect(component.lastColumnOrderUpdate).toBeNull();
    });

    it('should determine drop position based on mouse position', () => {
      const headerCells = Array.from(
        tableElement.querySelectorAll('th[sg-header-cell]'),
      ) as HTMLElement[];

      // Start drag on first column
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      });
      headerCells[0].dispatchEvent(dragStartEvent);

      // Drag to left side of second column (should insert before)
      const rect = headerCells[1].getBoundingClientRect();
      const dragOverLeftEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + 5,
      });
      Object.defineProperty(dragOverLeftEvent, 'dataTransfer', {
        value: new DataTransfer(),
        writable: false,
      });
      headerCells[1].dispatchEvent(dragOverLeftEvent);

      const dropLeftEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
      });
      headerCells[1].dispatchEvent(dropLeftEvent);

      expect(component.lastColumnOrderUpdate).not.toBeNull();
      const update1 = component.lastColumnOrderUpdate!;
      expect(update1.position).toBe('before');

      // Reset
      component.lastColumnOrderUpdate = null;
      const dragEndEvent = new DragEvent('dragend', { bubbles: true });
      headerCells[0].dispatchEvent(dragEndEvent);

      // Start new drag
      headerCells[0].dispatchEvent(dragStartEvent);

      // Drag to right side of second column (should insert after)
      const dragOverRightEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        clientX: rect.right - 5,
      });
      Object.defineProperty(dragOverRightEvent, 'dataTransfer', {
        value: new DataTransfer(),
        writable: false,
      });
      headerCells[1].dispatchEvent(dragOverRightEvent);

      const dropRightEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
      });
      headerCells[1].dispatchEvent(dropRightEvent);

      expect(component.lastColumnOrderUpdate).not.toBeNull();
      const update2 = component.lastColumnOrderUpdate!;
      expect(update2.position).toBe('after');
    });
  });

  describe('Column Resizing', () => {
    beforeEach(() => {
      component.enableResize.set(true);
      fixture.detectChanges();
    });

    it('should render resizer components when resizable is enabled', () => {
      const resizers = tableElement.querySelectorAll('sg-column-resizer');
      expect(resizers.length).toBe(3); // One for each column
    });

    it('should not render resizer components when resizable is disabled', () => {
      component.enableResize.set(false);
      fixture.detectChanges();

      const resizers = tableElement.querySelectorAll('sg-column-resizer');
      expect(resizers.length).toBe(0);
    });

    it('should apply initial widths to header cells', () => {
      const headerCells = Array.from(
        tableElement.querySelectorAll('th[sg-header-cell]'),
      ) as HTMLElement[];

      expect(headerCells[0].style.width).toBe('200px');
      expect(headerCells[1].style.width).toBe('150px');
      expect(headerCells[2].style.width).toBe('250px');
    });

    it('should emit updateColumnWidth event when column is resized', () => {
      const tableComponent = fixture.debugElement.query(
        (de) => de.componentInstance instanceof SgTableComponent,
      ).componentInstance as SgTableComponent<any>;

      tableComponent.onColumnWidthChange('username', 300, 200);

      expect(component.lastColumnWidthUpdate).toBeTruthy();
      if (component.lastColumnWidthUpdate) {
        expect(component.lastColumnWidthUpdate.columnId).toBe('username');
        expect(component.lastColumnWidthUpdate.width).toBe(300);
        expect(component.lastColumnWidthUpdate.previousWidth).toBe(200);
      }
    });

    it('should have relative positioning on header cells for resizer placement', () => {
      const headerCells = Array.from(
        tableElement.querySelectorAll('th[sg-header-cell]'),
      ) as HTMLElement[];

      headerCells.forEach((cell) => {
        const computedStyle = window.getComputedStyle(cell);
        expect(computedStyle.position).toBe('relative');
      });
    });
  });
});
