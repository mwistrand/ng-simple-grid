import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { SgGroupDialogComponent, GroupDialogData } from './sg-group-dialog.component';

describe('SgGroupDialogComponent', () => {
  let component: SgGroupDialogComponent;
  let fixture: ComponentFixture<SgGroupDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<DialogRef>;
  const mockData: GroupDialogData = { selectedCount: 3 };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('DialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [SgGroupDialogComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: mockData },
        { provide: DialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SgGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the selected count', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('3 selected rows');
  });

  it('should have an input for group name', () => {
    const input = fixture.nativeElement.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
  });

  it('should have cancel and confirm buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('Cancel');
    expect(buttons[1].textContent).toContain('Group');
  });

  it('should disable confirm button when group name is empty', () => {
    const confirmButton = fixture.nativeElement.querySelectorAll('button')[1];
    expect(confirmButton.disabled).toBe(true);
  });

  it('should close dialog with null when cancel is clicked', () => {
    const cancelButton = fixture.nativeElement.querySelectorAll('button')[0];
    cancelButton.click();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should close dialog with group name when confirm is clicked', () => {
    component['groupName'].set('Test Group');
    fixture.detectChanges();

    const confirmButton = fixture.nativeElement.querySelectorAll('button')[1];
    confirmButton.click();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ groupName: 'Test Group' });
  });
});
