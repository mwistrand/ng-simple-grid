import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SgRowGroupComponent } from './sg-row-group.component';

describe('SgRowGroupComponent', () => {
  let component: SgRowGroupComponent;
  let fixture: ComponentFixture<SgRowGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SgRowGroupComponent],
    });
    fixture = TestBed.createComponent(SgRowGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have role="rowgroup"', () => {
    const element = fixture.nativeElement;
    expect(element.getAttribute('role')).toBe('rowgroup');
  });

  it('should have sg-row-group class', () => {
    const element = fixture.nativeElement;
    expect(element.classList.contains('sg-row-group')).toBe(true);
  });
});
