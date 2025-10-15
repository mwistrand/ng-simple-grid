import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormsModule } from '@angular/forms';

export interface GroupDialogData {
  selectedCount: number;
}

export interface GroupDialogResult {
  groupName: string;
}

@Component({
  selector: 'sg-group-dialog',
  template: `
    <div class="sg-group-dialog">
      <h2 id="dialog-title">Group Rows</h2>
      <div class="sg-group-dialog-content">
        <p>Enter a name for the group of {{ data.selectedCount }} selected rows:</p>
        <label for="group-name-input" class="sg-visually-hidden">Group name</label>
        <input
          id="group-name-input"
          type="text"
          [(ngModel)]="groupName"
          (keydown.enter)="onConfirm()"
          placeholder="Enter group name"
          aria-describedby="dialog-title"
          #groupNameInput
        />
      </div>
      <div class="sg-group-dialog-actions">
        <button (click)="onCancel()" type="button">Cancel</button>
        <button (click)="onConfirm()" type="button" [disabled]="!groupName().trim()">Group</button>
      </div>
    </div>
  `,
  styles: `
    .sg-group-dialog {
      padding: 24px;
      min-width: 300px;
    }

    .sg-group-dialog h2 {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 500;
    }

    .sg-group-dialog-content {
      margin-bottom: 24px;

      p {
        margin: 0 0 12px 0;
      }

      input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;

        &:focus {
          outline: 2px solid #1976d2;
          outline-offset: 2px;
        }
      }
    }

    .sg-group-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;

      button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        background: #f5f5f5;
        color: #333;

        &:hover:not(:disabled) {
          background: #e0e0e0;
        }

        &:focus {
          outline: 2px solid #1976d2;
          outline-offset: 2px;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &:last-child {
          background: #1976d2;
          color: white;

          &:hover:not(:disabled) {
            background: #1565c0;
          }
        }
      }
    }

    .sg-visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class SgGroupDialogComponent {
  protected readonly data = inject<GroupDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<GroupDialogResult>);

  protected readonly groupName = signal('');

  protected onConfirm(): void {
    const name = this.groupName().trim();
    if (name) {
      this.dialogRef.close({ groupName: name });
    }
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
