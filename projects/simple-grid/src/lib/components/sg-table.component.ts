import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  forwardRef,
  Inject,
  Optional,
  QueryList,
  TrackByFunction,
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

  @ContentChildren(SgRowComponent, { read: ElementRef })
  rowElements?: QueryList<ElementRef>;

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
  }
}
