import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SgTableScrollComponent } from './sg-table-scroll.component';

describe(SgTableScrollComponent.name, () => {
  let component: SgTableScrollComponent;
  let fixture: ComponentFixture<SgTableScrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SgTableScrollComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SgTableScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
