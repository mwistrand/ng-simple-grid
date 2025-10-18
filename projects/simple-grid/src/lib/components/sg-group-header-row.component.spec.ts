import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SgGroupHeaderRowComponent } from './sg-group-header-row.component';

describe('SgGroupHeaderRowComponent', () => {
  let component: SgGroupHeaderRowComponent;
  let fixture: ComponentFixture<SgGroupHeaderRowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SgGroupHeaderRowComponent],
    });
    fixture = TestBed.createComponent(SgGroupHeaderRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have role="row"', () => {
    const element = fixture.nativeElement;
    expect(element.getAttribute('role')).toBe('row');
  });

  it('should have sg-group-header-row class', () => {
    const element = fixture.nativeElement;
    expect(element.classList.contains('sg-group-header-row')).toBe(true);
  });
});
