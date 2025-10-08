import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SgRowComponent } from './sg-row.component';
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

describe(SgRowComponent.name, () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const rowElement = fixture.nativeElement.querySelector('tr[sg-row]');
    expect(rowElement).toBeTruthy();
  });

  it('should have sg-row class', () => {
    const rowElement = fixture.nativeElement.querySelector('tr[sg-row]');
    expect(rowElement.classList.contains('sg-row')).toBe(true);
  });

  it('should have role attribute set to row', () => {
    const rowElement = fixture.nativeElement.querySelector('tr[sg-row]');
    expect(rowElement.getAttribute('role')).toBe('row');
  });
});
