import {
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  Inject,
  input,
  Optional,
  Renderer2,
  signal,
  ViewContainerRef,
  ComponentRef,
} from '@angular/core';
import { CdkColumnDef, CdkHeaderCell } from '@angular/cdk/table';
import {
  DRAGGABLE_COLUMN_FLAG_PROVIDER,
  DraggableColumnFlagProvider,
  RESIZABLE_COLUMN_FLAG_PROVIDER,
  ResizableColumnFlagProvider,
  SgTableComponent,
} from '../components/sg-table.component';
import { SgColumnResizerComponent } from '../components/sg-column-resizer.component';

export const SG_HEADER_CELL_SELECTOR = 'sg-header-cell, th[sg-header-cell]';

/**
 * Directive for header cells in a simple grid table.
 * Supports drag and drop functionality when enabled on the parent table.
 * Supports column resizing when enabled on the parent table.
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

  /** Whether this column is resizable. Defaults to true if table resizing is enabled. */
  readonly resizable = input<boolean>(true);

  /** Initial width in pixels */
  readonly width = input<number | undefined>(undefined);

  /** Minimum width in pixels (default: 50) */
  readonly minWidth = input<number>(50);

  /** Maximum width in pixels (default: 1000) */
  readonly maxWidth = input<number>(1000);

  /** Computed property that determines if this cell should be draggable based on table and cell settings. */
  protected isDraggable = computed(() => {
    if (this.isDndEnabled && this.isDndEnabled()) {
      return this.draggable() !== false;
    }
    return false;
  });

  /** Computed property that determines if this cell should be resizable based on table and cell settings. */
  protected isResizable = computed(() => {
    if (this.isResizeEnabled && this.isResizeEnabled()) {
      return this.resizable() !== false;
    }
    return false;
  });

  // Get column information from CdkColumnDef
  private columnDef = inject(CdkColumnDef, { optional: true });

  protected columnId = computed(() => this.columnDef?.name ?? '');
  protected columnName = computed(() => {
    // Extract readable name from column ID or use text content
    const id = this.columnId();
    return id.charAt(0).toUpperCase() + id.slice(1);
  });

  // Track current width - starts with initial width input or default
  protected currentWidth = signal<number>(this.width() ?? 150);
  private previousWidth = this.currentWidth();

  // Reference to the resizer component
  private resizerComponentRef: ComponentRef<SgColumnResizerComponent> | null = null;

  constructor(
    @Optional()
    @Inject(DRAGGABLE_COLUMN_FLAG_PROVIDER)
    private isDndEnabled: DraggableColumnFlagProvider,

    @Optional()
    @Inject(RESIZABLE_COLUMN_FLAG_PROVIDER)
    private isResizeEnabled: ResizableColumnFlagProvider,

    private hostElement: ElementRef,
    private renderer: Renderer2,
    private viewContainerRef: ViewContainerRef,
  ) {
    super();

    let originalTabIndex: string | undefined = undefined;
    let originalRole: string | undefined = undefined;

    // Effect to handle draggable state
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

      if (isDraggable) {
        renderer.setAttribute(el, 'tabIndex', '0');
        renderer.setAttribute(el, 'draggable', 'true');
        renderer.setAttribute(el, 'role', 'button');
        renderer.setAttribute(el, 'aria-grabbed', 'false');
      } else {
        if (originalTabIndex != null) {
          renderer.setAttribute(el, 'tabIndex', originalTabIndex);
        } else {
          renderer.removeAttribute(el, 'tabindex');
        }
        if (originalRole != null) {
          renderer.setAttribute(el, 'role', originalRole);
        } else {
          renderer.removeAttribute(el, 'role');
        }

        renderer.removeAttribute(el, 'draggable');
        renderer.removeAttribute(el, 'aria-grabbed');
      }
    });

    // Effect to apply initial width
    effect(() => {
      const initialWidth = this.width();
      if (initialWidth !== undefined) {
        this.currentWidth.set(initialWidth);
        this.applyWidth(initialWidth);
      }
    });

    // Effect to manage resizer component
    effect(() => {
      const shouldBeResizable = this.isResizable();

      if (shouldBeResizable && !this.resizerComponentRef) {
        // Create resizer component
        this.resizerComponentRef = this.viewContainerRef.createComponent(SgColumnResizerComponent);

        // IMPORTANT: Manually append the resizer element to the header cell
        // ViewContainerRef creates siblings, not children, so we need to move it
        const resizerElement = this.resizerComponentRef.location.nativeElement;
        this.renderer.appendChild(this.hostElement.nativeElement, resizerElement);

        // Set inputs
        this.resizerComponentRef.setInput('columnId', this.columnId());
        this.resizerComponentRef.setInput('columnName', this.columnName());
        this.resizerComponentRef.setInput('currentWidth', this.currentWidth());
        this.resizerComponentRef.setInput('minWidth', this.minWidth());
        this.resizerComponentRef.setInput('maxWidth', this.maxWidth());

        // Subscribe to outputs
        this.resizerComponentRef.instance.widthChange.subscribe((newWidth: number) => {
          this.onWidthChange(newWidth);
        });

        this.resizerComponentRef.instance.widthChangeComplete.subscribe((newWidth: number) => {
          this.onWidthChangeComplete(newWidth);
        });
      } else if (!shouldBeResizable && this.resizerComponentRef) {
        // Manually remove the element from DOM before destroying
        const resizerElement = this.resizerComponentRef.location.nativeElement;
        if (resizerElement.parentElement) {
          this.renderer.removeChild(resizerElement.parentElement, resizerElement);
        }

        // Destroy resizer component
        this.resizerComponentRef.destroy();
        this.resizerComponentRef = null;
      }

      // Update resizer inputs if it exists
      if (this.resizerComponentRef) {
        this.resizerComponentRef.setInput('currentWidth', this.currentWidth());
        this.resizerComponentRef.setInput('minWidth', this.minWidth());
        this.resizerComponentRef.setInput('maxWidth', this.maxWidth());
      }
    });
  }

  /**
   * Applies width to this header cell.
   * With table-layout: fixed, the browser automatically applies the header width to all cells in the column.
   */
  private applyWidth(width: number) {
    this.renderer.setStyle(this.hostElement.nativeElement, 'width', `${width}px`);
  }

  /**
   * Handles width changes during resize (live updates).
   */
  private onWidthChange(newWidth: number) {
    this.currentWidth.set(newWidth);
    this.applyWidth(newWidth);
  }

  /**
   * Handles width change completion (final value).
   * Notifies the table component for event emission.
   */
  private onWidthChangeComplete(newWidth: number) {
    // Notify table component for event emission (optional, for persistence)
    const table = inject(SgTableComponent, { optional: true });
    table?.onColumnWidthChange(this.columnId(), newWidth, this.previousWidth);
    this.previousWidth = newWidth;
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
