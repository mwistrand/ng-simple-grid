import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SgFooterRowComponent } from './sg-footer-row.component';
import { SgTableModule } from '../../sg-table.module';

@Component({
  template: `
    <table sg-table [dataSource]="data">
      <ng-container sgColumnDef="name">
        <th sg-header-cell *sgHeaderCellDef>Name</th>
        <td sg-cell *sgCellDef="let row">{{ row.name }}</td>
        <td sg-footer-cell *sgFooterCellDef>Footer</td>
      </ng-container>
      <tr sg-header-row *sgHeaderRowDef="['name']"></tr>
      <tr sg-row *sgRowDef="let row; columns: ['name']"></tr>
      <tr sg-footer-row *sgFooterRowDef="['name']"></tr>
    </table>
  `,
  imports: [SgTableModule],
})
class TestComponent {
  data = [{ name: 'Test' }];
}

describe(SgFooterRowComponent.name, () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const footerRowElement = fixture.nativeElement.querySelector('tr[sg-footer-row]');
    expect(footerRowElement).toBeTruthy();
  });

  it('should have sg-footer-row class', () => {
    const footerRowElement = fixture.nativeElement.querySelector('tr[sg-footer-row]');
    expect(footerRowElement.classList.contains('sg-footer-row')).toBe(true);
  });

  it('should have role attribute set to row', () => {
    const footerRowElement = fixture.nativeElement.querySelector('tr[sg-footer-row]');
    expect(footerRowElement.getAttribute('role')).toBe('row');
  });
});
