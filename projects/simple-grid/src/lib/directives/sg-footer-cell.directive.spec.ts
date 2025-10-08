import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SgFooterCellDirective } from './sg-footer-cell.directive';
import { SgTableModule } from '../../sg-table.module';

@Component({
  template: `
    <table sg-table [dataSource]="data">
      <ng-container sgColumnDef="name">
        <th sg-header-cell *sgHeaderCellDef>Name</th>
        <td sg-cell *sgCellDef="let row">{{ row.name }}</td>
        <td sg-footer-cell *sgFooterCellDef>Total</td>
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

describe(SgFooterCellDirective.name, () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const footerCellElement = fixture.nativeElement.querySelector('td[sg-footer-cell]');
    expect(footerCellElement).toBeTruthy();
  });

  it('should have sg-footer-cell class', () => {
    const footerCellElement = fixture.nativeElement.querySelector('td[sg-footer-cell]');
    expect(footerCellElement.classList.contains('sg-footer-cell')).toBe(true);
  });
});
