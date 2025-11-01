import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  Renderer2,
  signal,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Component that provides a visual and accessible interface for resizing table columns.
 * Supports both mouse/touch drag interactions and keyboard control via a native range input.
 */
@Component({
  selector: 'sg-column-resizer',
  template: `
    <div class="sg-column-resizer" (dragstart)="onDragStart($event)">
      <!-- Hidden but accessible range input for keyboard control -->
      <input
        type="range"
        class="sg-column-resizer-input"
        [attr.aria-label]="'Resize ' + columnName() + ' column'"
        [attr.aria-valuemin]="minWidth()"
        [attr.aria-valuemax]="maxWidth()"
        [attr.aria-valuenow]="currentWidth()"
        [attr.aria-valuetext]="currentWidth() + ' pixels'"
        [min]="minWidth()"
        [max]="maxWidth()"
        [value]="currentWidth()"
        (input)="onRangeInput($event)"
        (change)="onRangeChange($event)"
      />

      <!-- Visual drag handle -->
      <div
        class="sg-column-resizer-handle"
        [class.is-resizing]="isResizing()"
        [attr.aria-hidden]="true"
        (mousedown)="onMouseDown($event)"
        (touchstart)="onTouchStart($event)"
      ></div>
    </div>
  `,
  styleUrl: './sg-column-resizer.component.scss',
  host: {
    class: 'sg-column-resizer-host',
    '(dragstart)': 'onDragStart($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SgColumnResizerComponent {
  private renderer = inject(Renderer2);

  /** Column identifier */
  readonly columnId = input.required<string>();

  /** Column display name for ARIA labels */
  readonly columnName = input.required<string>();

  /** Current width in pixels */
  readonly currentWidth = input.required<number>();

  /** Minimum width in pixels */
  readonly minWidth = input<number>(50);

  /** Maximum width in pixels */
  readonly maxWidth = input<number>(1000);

  /** Emits new width during resize (for live updates) */
  readonly widthChange = output<number>();

  /** Emits final width after resize completes */
  readonly widthChangeComplete = output<number>();

  /** Whether currently resizing */
  protected isResizing = signal(false);

  /** Starting X position for drag */
  private startX = 0;

  /** Starting width for drag */
  private startWidth = 0;

  /** Ghost line element for visual feedback */
  private ghostLine: HTMLElement | null = null;

  /**
   * Prevents drag events from bubbling up to the header cell.
   * This ensures column drag-and-drop doesn't interfere with resizing.
   */
  onDragStart(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handles range input changes (keyboard interaction).
   * Emits width changes as the user adjusts the slider.
   */
  onRangeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const newWidth = parseInt(input.value, 10);
    this.widthChange.emit(newWidth);
  }

  /**
   * Handles range input final change (keyboard interaction).
   * Emits the final width when the user finishes adjusting.
   */
  onRangeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const newWidth = parseInt(input.value, 10);
    this.widthChangeComplete.emit(newWidth);
  }

  /**
   * Handles mouse down on the resize handle.
   * Initiates drag resize operation.
   */
  onMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.startResize(event.clientX);

    // Add global listeners for mouse move and up
    const mouseMoveListener = (e: MouseEvent) => this.onMouseMove(e);
    const mouseUpListener = (e: MouseEvent) => {
      this.onMouseUp(e);
      document.removeEventListener('mousemove', mouseMoveListener);
      document.removeEventListener('mouseup', mouseUpListener);
    };

    document.addEventListener('mousemove', mouseMoveListener);
    document.addEventListener('mouseup', mouseUpListener);
  }

  /**
   * Handles touch start on the resize handle.
   * Initiates touch resize operation.
   */
  onTouchStart(event: TouchEvent) {
    event.preventDefault();
    event.stopPropagation();

    const touch = event.touches[0];
    this.startResize(touch.clientX);

    // Add global listeners for touch move and end
    const touchMoveListener = (e: TouchEvent) => this.onTouchMove(e);
    const touchEndListener = (e: TouchEvent) => {
      this.onTouchEnd(e);
      document.removeEventListener('touchmove', touchMoveListener);
      document.removeEventListener('touchend', touchEndListener);
    };

    document.addEventListener('touchmove', touchMoveListener, { passive: false });
    document.addEventListener('touchend', touchEndListener);
  }

  /**
   * Initializes resize operation.
   */
  private startResize(clientX: number) {
    this.isResizing.set(true);
    this.startX = clientX;
    this.startWidth = this.currentWidth();

    // Create ghost line for visual feedback
    this.createGhostLine(clientX);

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }

  /**
   * Handles mouse move during resize.
   */
  private onMouseMove(event: MouseEvent) {
    if (!this.isResizing()) return;

    event.preventDefault();
    this.updateResize(event.clientX);
  }

  /**
   * Handles touch move during resize.
   */
  private onTouchMove(event: TouchEvent) {
    if (!this.isResizing()) return;

    event.preventDefault();
    const touch = event.touches[0];
    this.updateResize(touch.clientX);
  }

  /**
   * Updates resize based on current position.
   */
  private updateResize(clientX: number) {
    const delta = clientX - this.startX;
    let newWidth = this.startWidth + delta;

    // Enforce min/max constraints
    newWidth = Math.max(this.minWidth(), Math.min(this.maxWidth(), newWidth));

    // Update ghost line position
    this.updateGhostLine(clientX);

    // Emit width change for live updates
    this.widthChange.emit(newWidth);
  }

  /**
   * Handles mouse up to complete resize.
   */
  private onMouseUp(event: MouseEvent) {
    if (!this.isResizing()) return;

    event.preventDefault();
    this.endResize(event.clientX);
  }

  /**
   * Handles touch end to complete resize.
   */
  private onTouchEnd(event: TouchEvent) {
    if (!this.isResizing()) return;

    event.preventDefault();
    const touch = event.changedTouches[0];
    this.endResize(touch.clientX);
  }

  /**
   * Completes resize operation.
   */
  private endResize(clientX: number) {
    const delta = clientX - this.startX;
    let newWidth = this.startWidth + delta;

    // Enforce min/max constraints
    newWidth = Math.max(this.minWidth(), Math.min(this.maxWidth(), newWidth));

    // Emit final width change
    this.widthChangeComplete.emit(newWidth);

    // Clean up
    this.isResizing.set(false);
    this.removeGhostLine();
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }

  /**
   * Creates a ghost line for visual feedback during resize.
   */
  private createGhostLine(clientX: number) {
    this.ghostLine = this.renderer.createElement('div');
    this.renderer.addClass(this.ghostLine, 'sg-column-resize-ghost');
    this.renderer.setStyle(this.ghostLine, 'left', `${clientX}px`);
    this.renderer.appendChild(document.body, this.ghostLine);
  }

  /**
   * Updates ghost line position during resize.
   */
  private updateGhostLine(clientX: number) {
    if (this.ghostLine) {
      this.renderer.setStyle(this.ghostLine, 'left', `${clientX}px`);
    }
  }

  /**
   * Removes ghost line after resize completes.
   */
  private removeGhostLine() {
    if (this.ghostLine) {
      this.renderer.removeChild(document.body, this.ghostLine);
      this.ghostLine = null;
    }
  }
}
