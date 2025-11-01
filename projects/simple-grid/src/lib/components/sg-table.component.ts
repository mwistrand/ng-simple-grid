import {
  afterEveryRender,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  Inject,
  InjectionToken,
  input,
  Optional,
  output,
  QueryList,
  signal,
  TrackByFunction,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import {
  CdkTable,
  CDK_TABLE,
  STICKY_POSITIONING_LISTENER,
  HeaderRowOutlet,
  DataRowOutlet,
  NoDataRowOutlet,
  FooterRowOutlet,
  CdkTableDataSourceInput,
} from '@angular/cdk/table';

import {
  _DisposeViewRepeaterStrategy,
  _RecycleViewRepeaterStrategy,
  _VIEW_REPEATER_STRATEGY,
} from '@angular/cdk/collections';
import {
  SCROLL_DATA_SOURCE_TOKEN,
  SCROLL_TRACK_BY_TOKEN,
  ScrollDataSourceProvider,
  ScrollTrackByProvider,
} from './sg-table-scroll.component';
import { SgRowComponent } from './sg-row.component';
import {
  SG_HEADER_CELL_SELECTOR,
  SgHeaderCellDirective,
} from '../directives/sg-header-cell.directive';
import { ColumnWidthUpdate } from '../models/column-width-config';

/** Position relative to the target column where a dragged column should be inserted. */
export type ColumnOrderPosition = 'before' | 'after' | null;

/**
 * Event payload emitted when column order changes due to drag and drop.
 */
export interface ColumnOrderUpdate {
  /** The index of the column being moved */
  from: number;
  /** The index of the target column */
  to: number;
  /** Where to insert the dragged column relative to the target */
  position: ColumnOrderPosition;
}

/** Provider function that returns whether drag and drop is enabled for columns. */
export type DraggableColumnFlagProvider = () => boolean | undefined | null;

/** Injection token for providing drag and drop enabled state to child directives. */
export const DRAGGABLE_COLUMN_FLAG_PROVIDER = new InjectionToken<DraggableColumnFlagProvider>(
  'SgDraggableColumnFlagToken',
);

/** Provider function that returns whether column resizing is enabled. */
export type ResizableColumnFlagProvider = () => boolean | undefined | null;

/** Injection token for providing resize enabled state to child directives. */
export const RESIZABLE_COLUMN_FLAG_PROVIDER = new InjectionToken<ResizableColumnFlagProvider>(
  'SgResizableColumnFlagToken',
);

@Component({
  selector: 'sg-table table[sg-table]',
  exportAs: 'sgTable',
  template: `
    <ng-content select="caption" />
    <ng-content select="colgroup, col" />

    <!--
      Unprojected content throws a hydration error so we need this to capture it.
      It gets removed on the client so it doesn't affect the layout.
    -->
    @if (_isServer) {
      <ng-content />
    }

    @if (_isNativeHtmlTable) {
      <thead role="rowgroup">
        <ng-container headerRowOutlet />
      </thead>
      <tbody class="sg-table-content" role="rowgroup">
        <ng-container rowOutlet />
        <ng-container noDataRowOutlet />
      </tbody>
      <tfoot role="rowgroup">
        <ng-container footerRowOutlet />
      </tfoot>
    } @else {
      <ng-container headerRowOutlet />
      <ng-container rowOutlet />
      <ng-container noDataRowOutlet />
      <ng-container footerRowOutlet />
    }
  `,
  styleUrl: './sg-table.component.scss',
  host: {
    class: 'sg-table',
    '[class.sg-table-fixed-layout]': 'fixedLayout',
  },
  providers: [
    { provide: CdkTable, useExisting: forwardRef(() => SgTableComponent) },
    { provide: CDK_TABLE, useExisting: forwardRef(() => SgTableComponent) },
    { provide: _VIEW_REPEATER_STRATEGY, useClass: _DisposeViewRepeaterStrategy },
    // Prevent nested tables from seeing this table's StickyPositioningListener.
    { provide: STICKY_POSITIONING_LISTENER, useValue: null },
    {
      provide: DRAGGABLE_COLUMN_FLAG_PROVIDER,
      useFactory: (comp: SgTableComponent<any>) => () => comp.dnd(),
      deps: [forwardRef(() => SgTableComponent<any>)],
    },
    {
      provide: RESIZABLE_COLUMN_FLAG_PROVIDER,
      useFactory: (comp: SgTableComponent<any>) => () => comp.resizable(),
      deps: [forwardRef(() => SgTableComponent<any>)],
    },
  ],
  encapsulation: ViewEncapsulation.None,
  // See note on CdkTable for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [HeaderRowOutlet, DataRowOutlet, NoDataRowOutlet, FooterRowOutlet],
})
export class SgTableComponent<T> extends CdkTable<T> {
  /** Overrides the sticky CSS class set by the `CdkTable`. */
  protected override stickyCssClass = 'sg-table-sticky';

  /** Overrides the need to add position: sticky on every sticky cell element in `CdkTable`. */
  protected override needsPositionStickyOnElement = false;

  private hostRef = inject(ElementRef);

  @ContentChildren(SgHeaderCellDirective)
  headerCells?: QueryList<SgHeaderCellDirective>;

  @ContentChildren(SgRowComponent, { read: ElementRef })
  rowElements?: QueryList<ElementRef>;

  private draggedColumnIndex = signal<number | null>(null);
  private dropTargetIndex = signal<number | null>(null);
  private dropPosition = signal<'before' | 'after' | null>(null);
  private touchCurrentIndex: number | null = null;
  private focusHeaderCellIndex: number | null = null;

  private hostTouchStartListener?: EventListener;
  private hostTouchMoveListener?: EventListener;
  private hostTouchEndListener?: EventListener;

  /** Enable drag and drop for columns */
  readonly dnd = input(false);

  /** Enable column resizing functionality */
  readonly resizable = input<boolean>(false);

  /**
   * Emits when column order changes due to drag and drop operation.
   * Contains information about the source and target column indices and the drop position.
   */
  readonly updateColumnOrder = output<ColumnOrderUpdate>();

  /**
   * Emits when column width changes.
   * Contains information about which column was resized and its new width.
   */
  readonly updateColumnWidth = output<ColumnWidthUpdate>();

  override get dataSource(): CdkTableDataSourceInput<T> {
    const dataSource = super.dataSource;
    if (dataSource) {
      return dataSource;
    }
    return this.parentDataSourceProvider != null ? this.parentDataSourceProvider() : dataSource;
  }
  override set dataSource(dataSource: CdkTableDataSourceInput<T>) {
    if (this.parentDataSourceProvider != null) {
      throw new Error('`dataSource` cannot be set when the parent scroll container provides one.');
    }
    super.dataSource = dataSource;
  }

  override get trackBy(): TrackByFunction<T> {
    const trackBy = super.trackBy;
    if (trackBy) {
      return trackBy;
    }
    return this.parentTrackByProvider != null ? this.parentTrackByProvider() : trackBy;
  }
  override set trackBy(trackBy: TrackByFunction<T>) {
    if (this.parentTrackByProvider != null) {
      throw new Error('`trackBy` cannot be set when the parent scroll container provides one.');
    }
    super.trackBy = trackBy;
  }

  constructor(
    @Optional()
    @Inject(SCROLL_DATA_SOURCE_TOKEN)
    private parentDataSourceProvider: ScrollDataSourceProvider<T>,

    @Optional()
    @Inject(SCROLL_TRACK_BY_TOKEN)
    private parentTrackByProvider: ScrollTrackByProvider<T>,
  ) {
    super();

    afterEveryRender({
      write: () => {
        // Unfortunately, QueryList's order does not reflect the DOM order. As such, we have to
        // read the DOM directly to focus the correct header cell.
        if (this.focusHeaderCellIndex != null) {
          const headerCells = this.hostRef?.nativeElement.querySelectorAll(SG_HEADER_CELL_SELECTOR);
          const toFocus = headerCells?.[this.focusHeaderCellIndex];
          toFocus?.focus();
          this.focusHeaderCellIndex = null;
        }
      },
    });
  }

  override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    this.initializeDragAndDrop();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();

    const host = this.hostRef?.nativeElement;
    if (!host) {
      return;
    }

    if (this.hostTouchStartListener) {
      host.removeEventListener('touchstart', this.hostTouchStartListener);
      this.hostTouchStartListener = undefined;
    }
    if (this.hostTouchMoveListener) {
      host.removeEventListener('touchmove', this.hostTouchMoveListener, { passive: false });
      this.hostTouchMoveListener = undefined;
    }
    if (this.hostTouchEndListener) {
      host.removeEventListener('touchend', this.hostTouchEndListener);
      this.hostTouchEndListener = undefined;
    }
  }

  /**
   * Initializes drag and drop functionality by setting up touch event listeners
   * on the table host element.
   */
  private initializeDragAndDrop() {
    const host = this.hostRef?.nativeElement;
    if (!host) {
      return;
    }

    this.hostTouchStartListener = ((event: TouchEvent) =>
      this.onHostTouchStart(event)) as EventListener;
    host.addEventListener('touchstart', this.hostTouchStartListener);

    this.hostTouchMoveListener = ((event: TouchEvent) =>
      this.onHostTouchMove(event)) as EventListener;
    host.addEventListener('touchmove', this.hostTouchMoveListener, { passive: false });

    this.hostTouchEndListener = ((event: TouchEvent) =>
      this.onHostTouchEnd(event)) as EventListener;
    host.addEventListener('touchend', this.hostTouchEndListener);
  }

  /**
   * Handles the dragstart event when a column header starts being dragged.
   * Sets visual feedback and initializes drag state.
   */
  @HostListener('dragstart', ['$event'])
  onHostDragStart(event: DragEvent) {
    if (!untracked(this.dnd)) {
      return;
    }

    const index = this.getHeaderCellIndex(event.target as Element);
    if (index < 0) {
      return;
    }
    this.draggedColumnIndex.set(index);
    const target = event.target as HTMLElement;
    target.style.opacity = '0.5';
    target.setAttribute('aria-grabbed', 'true');

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', target.innerHTML);
    }
  }

  @HostListener('dragover', ['$event'])
  onHostDragOver(event: DragEvent) {
    if (!untracked(this.dnd)) {
      return;
    }

    const target = event.target as HTMLElement;
    const cell = this.getHeaderCell(target);
    if (!cell) return;

    event.preventDefault();

    const index = this.getHeaderCellIndex(cell);
    if (index < 0) {
      return;
    }
    const draggedIndex = this.draggedColumnIndex();
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    const rect = cell.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    const position = event.clientX < midpoint ? 'before' : 'after';

    this.dropTargetIndex.set(index);
    this.dropPosition.set(position);

    this.headerCells?.forEach((headerCell) => {
      headerCell.setIsDropCandidate(headerCell.is(cell));
    });

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  @HostListener('dragleave', ['$event'])
  onHostDragLeave(event: DragEvent) {
    if (!untracked(this.dnd)) {
      return;
    }

    const target = event.target as HTMLElement;
    const cell = this.getHeaderCell(target);
    if (cell) {
      cell.classList.remove('is-drop-candidate');
    }
  }

  @HostListener('drop', ['$event'])
  onHostDrop(event: DragEvent) {
    if (!untracked(this.dnd)) {
      return;
    }

    const targetIndex = this.getHeaderCellIndex(event.target as Element);
    if (targetIndex < 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const draggedIndex = this.draggedColumnIndex();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      return;
    }

    const position = this.dropPosition();
    this.reorderColumns(draggedIndex, targetIndex, position);
  }

  @HostListener('dragend', ['$event'])
  onHostDragEnd(event: DragEvent) {
    if (!untracked(this.dnd)) {
      return;
    }

    const target = event.target as HTMLElement;
    target.style.opacity = '';
    target.setAttribute('aria-grabbed', 'false');

    // Remove all drop candidate classes
    this.headerCells?.forEach((headerCell) => {
      headerCell.setIsDropCandidate(false);
    });

    this.draggedColumnIndex.set(null);
    this.dropTargetIndex.set(null);
    this.dropPosition.set(null);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!untracked(this.dnd)) {
      return;
    }
    if (!event.shiftKey) {
      return;
    }

    const cells = this.headerCells;
    if (!cells) {
      return;
    }

    const index = this.getHeaderCellIndex(event.target as Element);
    if (index < 0) {
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusHeaderCellIndex = index - 1;
      this.reorderColumns(index, this.focusHeaderCellIndex, 'before');
    } else if (event.key === 'ArrowRight' && index < cells.length - 1) {
      event.preventDefault();
      this.focusHeaderCellIndex = index + 1;
      this.reorderColumns(index, this.focusHeaderCellIndex, 'after');
    }
  }

  private onHostTouchStart(event: TouchEvent) {
    if (!untracked(this.dnd)) {
      return;
    }

    const index = this.getHeaderCellIndex(event.target as Element);
    if (index < 0) {
      return;
    }

    event.preventDefault();
    this.draggedColumnIndex.set(index);
    const target = event.target as HTMLElement;
    target.style.opacity = '0.5';
    target.setAttribute('aria-grabbed', 'true');
  }

  private onHostTouchMove(event: TouchEvent) {
    if (!untracked(this.dnd)) {
      return;
    }

    if (this.draggedColumnIndex() === null) {
      return;
    }

    event.preventDefault();

    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const cell = this.getHeaderCell(element);
    if (!cell) return;

    const { headerCells } = this;
    const index = this.getHeaderCellIndex(cell);

    if (index === -1 || index === this.draggedColumnIndex()) return;

    const rect = cell.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    const position = touch.clientX < midpoint ? 'before' : 'after';

    this.touchCurrentIndex = index;
    this.dropPosition.set(position);

    headerCells?.forEach((headerCell) => {
      headerCell.setIsDropCandidate(headerCell.is(cell));
    });
  }

  private onHostTouchEnd(event: TouchEvent) {
    if (!untracked(this.dnd)) {
      return;
    }

    const draggedIndex = this.draggedColumnIndex();
    const targetIndex = this.touchCurrentIndex;

    if (draggedIndex !== null && targetIndex !== null && draggedIndex !== targetIndex) {
      const position = this.dropPosition();
      this.reorderColumns(draggedIndex, targetIndex, position);
    }

    // Clean up - reset opacity on dragged element
    const target = event.target as HTMLElement;
    if (target) {
      target.style.opacity = '';
      target.setAttribute('aria-grabbed', 'false');
    }

    this.headerCells?.forEach((headerCell) => {
      headerCell.setIsDropCandidate(false);
    });

    this.touchCurrentIndex = null;
    this.draggedColumnIndex.set(null);
    this.dropPosition.set(null);
  }

  /**
   * Retrieves the header cell element from a given target, traversing up the DOM tree.
   * @param target The element to search from
   * @returns The header cell element or null if not found
   */
  private getHeaderCell(target: Element): HTMLElement | null {
    return target.closest(SG_HEADER_CELL_SELECTOR);
  }

  /**
   * Gets the index of a header cell within the table.
   * @param target The element to find the index for
   * @returns The zero-based index of the header cell, or -1 if not found
   */
  private getHeaderCellIndex(target: Element): number {
    let index = -1;
    const targetCell = this.getHeaderCell(target);
    if (!targetCell) {
      return index;
    }

    const headerCells = this.hostRef?.nativeElement.querySelectorAll(SG_HEADER_CELL_SELECTOR);
    if (!headerCells) {
      return index;
    }
    return [...headerCells].findIndex((headerCell: Element) => headerCell === targetCell);
  }

  /**
   * Emits a column reorder event with the source and target indices and position.
   * @param fromIndex The index of the column being moved
   * @param toIndex The index of the target column
   * @param position Whether to insert before or after the target column
   */
  private reorderColumns(fromIndex: number, toIndex: number, position: 'before' | 'after' | null) {
    this.updateColumnOrder.emit({
      from: fromIndex,
      to: toIndex,
      position,
    });
  }

  /**
   * Method that header cells can call to notify table of width changes.
   * This allows the table to emit events for persistence/logging.
   * @param columnId The column identifier
   * @param newWidth The new width in pixels
   * @param previousWidth The previous width in pixels
   */
  onColumnWidthChange(columnId: string, newWidth: number, previousWidth: number) {
    this.updateColumnWidth.emit({
      columnId,
      width: newWidth,
      previousWidth,
    });
  }
}
