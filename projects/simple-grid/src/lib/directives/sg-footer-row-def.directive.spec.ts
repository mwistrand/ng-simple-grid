import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SgFooterRowDefDirective } from './sg-footer-row-def.directive';
import { SgTableModule } from '../../sg-table.module';

@Component({
  template: `
    <table sg-table [dataSource]="data">
      <ng-container sgColumnDef="test">
        <th sg-header-cell *sgHeaderCellDef>Header</th>
        <td sg-cell *sgCellDef="let row">{{ row }}</td>
        <td sg-footer-cell *sgFooterCellDef>Footer</td>
      </ng-container>
      <tr sg-header-row *sgHeaderRowDef="['test']"></tr>
      <tr sg-row *sgRowDef="let row; columns: ['test']"></tr>
      <tr sg-footer-row *sgFooterRowDef="['test']"></tr>
    </table>
  `,
  imports: [SgTableModule],
})
class TestComponent {
  data = ['Test'];
}

describe(SgFooterRowDefDirective.name, () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toBeTruthy();
  });
});
