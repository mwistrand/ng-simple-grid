import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SgTableComponent } from './sg-table.component';
import { SgTableModule } from '../../sg-table.module';

@Component({
  template: `
    <table sg-table>
      <ng-container sgColumnDef="username">
        <th sg-header-cell *sgHeaderCellDef> User name </th>
        <td sg-cell *sgCellDef="let row"> {{row.username}} </td>
      </ng-container>

      <!-- Age Definition -->
      <ng-container sgColumnDef="age">
        <th sg-header-cell *sgHeaderCellDef> Age </th>
        <td sg-cell *sgCellDef="let row"> {{row.age}} </td>
      </ng-container>

      <!-- Title Definition -->
      <ng-container sgColumnDef="title">
        <th sg-header-cell *sgHeaderCellDef> Title </th>
        <td sg-cell *sgCellDef="let row"> {{row.title}} </td>
      </ng-container>

      <!-- Header and Row Declarations -->
      <tr sg-header-row *sgHeaderRowDef="['username', 'age', 'title']"></tr>
      <tr sg-row *sgRowDef="let row; columns: ['username', 'age', 'title']"></tr>
    </table>
  `,
  imports: [SgTableModule],
})
class TestComponent {
  config = undefined;
}

describe(SgTableComponent.name, () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add sg-table class to host element', () => {
    const tableElement = fixture.nativeElement.querySelector('table');
    expect(tableElement.classList.contains('sg-table')).toBe(true);
  });
});
