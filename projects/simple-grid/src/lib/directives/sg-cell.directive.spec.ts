import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SgCellDirective } from './sg-cell.directive';
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

describe(SgCellDirective.name, () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const cellElement = fixture.nativeElement.querySelector('td[sg-cell]');
    expect(cellElement).toBeTruthy();
  });

  it('should have sg-cell class', () => {
    const cellElement = fixture.nativeElement.querySelector('td[sg-cell]');
    expect(cellElement.classList.contains('sg-cell')).toBe(true);
  });
});
