import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SgHeaderCellDirective } from './sg-header-cell.directive';
import { SgTableModule } from '../../sg-table.module';

@Component({
  template: `
    <table sg-table [dataSource]="data" [resizable]="enableResize">
      <ng-container sgColumnDef="name">
        <th sg-header-cell *sgHeaderCellDef [width]="columnWidth" [minWidth]="100" [maxWidth]="400">
          Name
        </th>
        <td sg-cell *sgCellDef="let row">{{ row.name }}</td>
      </ng-container>
      <tr sg-header-row *sgHeaderRowDef="['name']"></tr>
      <tr sg-row *sgRowDef="let row; columns: ['name']"></tr>
    </table>
  `,
  imports: [SgTableModule],
})
class TestComponent {
  data = [{ name: 'Test' }];
  enableResize = false;
  columnWidth = 200;
}

describe(SgHeaderCellDirective.name, () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const headerCellElement = fixture.nativeElement.querySelector('th[sg-header-cell]');
    expect(headerCellElement).toBeTruthy();
  });

  it('should have sg-header-cell class', () => {
    const headerCellElement = fixture.nativeElement.querySelector('th[sg-header-cell]');
    expect(headerCellElement.classList.contains('sg-header-cell')).toBe(true);
  });

  it('should have role attribute set to columnheader', () => {
    const headerCellElement = fixture.nativeElement.querySelector('th[sg-header-cell]');
    expect(headerCellElement.getAttribute('role')).toBe('columnheader');
  });

  describe('Column Resizing', () => {
    it('should apply initial width when specified', () => {
      const headerCellElement = fixture.nativeElement.querySelector(
        'th[sg-header-cell]',
      ) as HTMLElement;
      expect(headerCellElement.style.width).toBe('200px');
    });

    it('should render resizer when resizable is enabled', () => {
      fixture.componentInstance.enableResize = true;
      fixture.detectChanges();

      const resizer = fixture.nativeElement.querySelector('sg-column-resizer');
      expect(resizer).toBeTruthy();
    });

    it('should not render resizer when resizable is disabled', () => {
      fixture.componentInstance.enableResize = false;
      fixture.detectChanges();

      const resizer = fixture.nativeElement.querySelector('sg-column-resizer');
      expect(resizer).toBeFalsy();
    });

    it('should render resizer inside the header cell (not as sibling)', () => {
      fixture.componentInstance.enableResize = true;
      fixture.detectChanges();

      const headerCell = fixture.nativeElement.querySelector('th[sg-header-cell]');
      const resizer = headerCell.querySelector('sg-column-resizer');

      expect(resizer).toBeTruthy();
      expect(resizer.parentElement).toBe(headerCell);
    });

    it('should update width when input changes', () => {
      fixture.componentInstance.columnWidth = 300;
      fixture.detectChanges();

      const headerCellElement = fixture.nativeElement.querySelector(
        'th[sg-header-cell]',
      ) as HTMLElement;
      expect(headerCellElement.style.width).toBe('300px');
    });
  });
});
