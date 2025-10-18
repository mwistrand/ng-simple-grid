import { Component, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SgGroupHeaderRowDefDirective } from './sg-group-header-row-def.directive';

@Component({
  template: `
    <ng-template #tmpl sgGroupHeaderRowDef>
      <div>Group Header</div>
    </ng-template>
  `,
  imports: [SgGroupHeaderRowDefDirective],
})
class TestComponent {
  @ViewChild(SgGroupHeaderRowDefDirective) directive!: SgGroupHeaderRowDefDirective;
  @ViewChild('tmpl', { read: TemplateRef }) templateRef!: TemplateRef<any>;
}

describe('SgGroupHeaderRowDefDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.directive).toBeTruthy();
  });

  it('should have templateRef', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.directive.templateRef).toBeTruthy();
  });
});
