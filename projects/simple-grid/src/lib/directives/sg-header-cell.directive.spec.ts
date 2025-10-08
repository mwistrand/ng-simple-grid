import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SgHeaderCellDirective } from './sg-header-cell.directive';
import { SgTableModule } from '../../sg-table.module';

@Component({
  template: `
    <table sg-table [dataSource]="data">
      <ng-container sgColumnDef="name">
        <th sg-header-cell *sgHeaderCellDef>Name</th>
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
});
