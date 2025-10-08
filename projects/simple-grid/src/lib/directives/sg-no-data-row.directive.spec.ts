import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SgNoDataRowDirective } from './sg-no-data-row.directive';
import { SgTableModule } from '../../sg-table.module';

@Component({
  template: `
    <table sg-table [dataSource]="[]">
      <ng-container sgColumnDef="test">
        <th sg-header-cell *sgHeaderCellDef>Header</th>
        <td sg-cell *sgCellDef="let row">{{ row }}</td>
      </ng-container>
      <tr sg-header-row *sgHeaderRowDef="['test']"></tr>
      <tr sg-row *sgRowDef="let row; columns: ['test']"></tr>
      <ng-template sgNoDataRow>
        <td>No data</td>
      </ng-template>
    </table>
  `,
  imports: [SgTableModule],
})
class TestComponent {}

describe(SgNoDataRowDirective.name, () => {
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
