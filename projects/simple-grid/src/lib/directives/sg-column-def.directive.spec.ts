import { TestBed } from '@angular/core/testing';
import { SgColumnDefDirective } from './sg-column-def.directive';

describe(SgColumnDefDirective.name, () => {
  it('should create an instance', () => {
    TestBed.configureTestingModule({});
    const directive = TestBed.runInInjectionContext(() => new SgColumnDefDirective());
    expect(directive).toBeTruthy();
  });
});
