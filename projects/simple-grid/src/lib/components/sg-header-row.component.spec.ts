import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SgHeaderRowComponent } from './sg-header-row.component';
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

describe(SgHeaderRowComponent.name, () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const headerRowElement = fixture.nativeElement.querySelector('tr[sg-header-row]');
    expect(headerRowElement).toBeTruthy();
  });

  it('should have sg-header-row class', () => {
    const headerRowElement = fixture.nativeElement.querySelector('tr[sg-header-row]');
    expect(headerRowElement.classList.contains('sg-header-row')).toBe(true);
  });

  it('should have role attribute set to row', () => {
    const headerRowElement = fixture.nativeElement.querySelector('tr[sg-header-row]');
    expect(headerRowElement.getAttribute('role')).toBe('row');
  });
});
