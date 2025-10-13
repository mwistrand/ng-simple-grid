import {
  computed,
  Directive,
  effect,
  ElementRef,
  Inject,
  input,
  Optional,
  Renderer2,
} from '@angular/core';
import { CdkHeaderCell } from '@angular/cdk/table';
import {
  DRAGGABLE_COLUMN_FLAG_PROVIDER,
  DraggableColumnFlagProvider,
} from '../components/sg-table.component';

export const SG_HEADER_CELL_SELECTOR = 'sg-header-cell, th[sg-header-cell]';

/**
 * Directive for header cells in a simple grid table.
 * Supports drag and drop functionality when enabled on the parent table.
 */
@Directive({
  selector: SG_HEADER_CELL_SELECTOR,
  host: {
    class: 'sg-header-cell',
    role: 'columnheader',
  },
})
export class SgHeaderCellDirective extends CdkHeaderCell {
  /** Whether this individual column is draggable. Defaults to true. */
  readonly draggable = input<boolean>(true);

  /** Computed property that determines if this cell should be draggable based on table and cell settings. */
  protected isDraggable = computed(() => {
    if (this.isDndEnabled && this.isDndEnabled()) {
      return this.draggable() !== false;
    }
    return false;
  });

  constructor(
    @Optional()
    @Inject(DRAGGABLE_COLUMN_FLAG_PROVIDER)
    private isDndEnabled: DraggableColumnFlagProvider,

    private hostElement: ElementRef,
    private renderer: Renderer2,
  ) {
    super();

    let originalTabIndex: string | undefined = undefined;
    let originalRole: string | undefined = undefined;
    effect(() => {
      const isDraggable = this.isDraggable();
      const el = hostElement?.nativeElement;
      if (el == null) {
        return;
      }
      if (originalRole == null) {
        originalRole = el.getAttribute('role');
      }
      if (originalTabIndex == null) {
        originalTabIndex = el.getAttribute('tabindex');
      }
      renderer.setProperty(el, 'tabIndex', isDraggable ? 0 : originalTabIndex);
      renderer.setProperty(el, 'draggable', isDraggable ? 'true' : undefined);
      renderer.setProperty(el, 'role', isDraggable ? 'button' : originalRole);
      renderer.setProperty(el, 'aria-grabbed', isDraggable ? 'false' : undefined);
    });
  }

  /**
   * Checks if this header cell element matches the given target element.
   * @param target The element to compare against
   * @returns True if the target is this header cell
   */
  is(target: Element) {
    return this.hostElement?.nativeElement === target;
  }

  /**
   * Sets whether this header cell is currently a drop candidate during drag operations.
   * Updates visual styling and ARIA attributes accordingly.
   * @param isCandidate Whether this cell is a valid drop target
   */
  setIsDropCandidate(isCandidate: boolean) {
    const el = this.hostElement?.nativeElement;
    if (el == null) {
      return;
    }
    if (isCandidate) {
      this.renderer.addClass(el, 'is-drop-candidate');
      this.renderer.setAttribute(el, 'aria-grabbed', 'true');
    } else {
      this.renderer.removeClass(el, 'is-drop-candidate');
      this.renderer.setAttribute(el, 'aria-grabbed', 'false');
    }
  }
}
