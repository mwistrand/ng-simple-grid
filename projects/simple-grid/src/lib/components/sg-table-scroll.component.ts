import { CdkTableDataSourceInput } from '@angular/cdk/table';
import { AfterContentChecked, afterEveryRender, Component, computed, ContentChild, ElementRef, forwardRef, inject, InjectionToken, input, NgZone, OnDestroy, OnInit, output, TrackByFunction, untracked } from '@angular/core';
import { distinctUntilChanged, skip, Subject, takeUntil } from 'rxjs';
import { LoadingState, SgTableLoadingDirection, VirtualizedDataSource } from '../models';
import { SgTableComponent } from './sg-table.component';

export type ScrollDataSourceProvider<T> = () => CdkTableDataSourceInput<T>;
export type ScrollTrackByProvider<T> = () => TrackByFunction<T>;

export const SCROLL_DATA_SOURCE_TOKEN = new InjectionToken<ScrollDataSourceProvider<any>>('SgScrollDataSourceToken');
export const SCROLL_TRACK_BY_TOKEN = new InjectionToken<ScrollTrackByProvider<any>>('SgScrollTrackByToken');

@Component({
  selector: 'sg-table-scroll',
  template: `<ng-content></ng-content>`,
  styleUrl: './sg-table-scroll.component.scss',
  host: {
    'class': 'sg-table-scroll',
    'tabindex': '0'
  },
  imports: [],
  providers: [{
    provide: SCROLL_DATA_SOURCE_TOKEN,
    useFactory: (comp: SgTableScrollComponent) => () => comp.virtualizedDataSource(),
    deps: [forwardRef(() => SgTableScrollComponent)]
  }, {
    provide: SCROLL_TRACK_BY_TOKEN,
    useFactory: (comp: SgTableScrollComponent) => () => comp.trackBy(),
    deps: [forwardRef(() => SgTableScrollComponent)]
  }]
})
/**
 * Component providing infinite scroll and virtualized rendering for tables.
 * Handles intersection observation, scroll events, and data loading triggers.
 *
 * @template T The type of data in the table rows.
 */
export class SgTableScrollComponent<T = any> implements AfterContentChecked, OnInit, OnDestroy {
  /**
   * Emits when the component is destroyed to clean up subscriptions.
   * @private
   */
  private readonly destroySubject = new Subject<void>();

  /**
   * Reference to the child SgTableComponent, if present.
   */
  @ContentChild(SgTableComponent)
  private tableComponent?: SgTableComponent<T>;

  /**
   * Stores the previous first row element for scroll restoration.
   * @private
   */
  private previousFirstRow?: ElementRef;

  /**
   * Reference to the host element of this component.
   * @private
   */
  private readonly hostRef = inject(ElementRef);

  /**
   * Inject NgZone to run tasks outside of Angular
   */
  private readonly zone = inject(NgZone);

  /**
   * Number of rows removed in the last update, used for scroll restoration.
   * @private
   */
  private lastRemovedCount = 0;

  /**
   * The direction of the most recent scroll-triggered data request.
   * @private
   */
  private currentScrollDirection: SgTableLoadingDirection = 'next';

  /**
   * IntersectionObserver instance for infinite scroll.
   * @private
   */
  private intersectionObserver?: IntersectionObserver;

  /**
   * Sentinel element at the bottom of the scroll container.
   * @private
   */
  private bottomSentinelElement?: HTMLElement;

  /**
   * Sentinel element at the top of the scroll container.
   * @private
   */
  private topSentinelElement?: HTMLElement;

  /**
   * Scroll event listener for the host element.
   * @private
   */
  private hostScrollListener?: EventListener;

  /**
   * Number of items to load per batch.
   * @default 50
   */
  readonly batchSize = input<number | null | undefined>(50);

  /**
   * Percentage of viewport distance to trigger loading when scrolling up..
   * For example, 20 means load when scrolled 20% toward the boundary.
   * @default 20
   */
  readonly loadThresholdPercentTop = input<number | null | undefined>(20);

  /**
   * Percentage of viewport distance to trigger loading when scrolling down..
   * For example, 20 means load when scrolled 20% toward the boundary.
   * @default 20
   */
  readonly loadThresholdPercentBottom = input<number | null | undefined>(20);

  /**
   * Maximum number of items to render at once.
   */
  readonly maxRenderItemCount = input<number | null | undefined>();

  /**
   * The data source for the table.
   */
  readonly dataSource = input<CdkTableDataSourceInput<T>>();

  /**
   * TrackBy function for table rows.
   */
  readonly trackBy = input.required<TrackByFunction<T>>();

  /**
   * Computed virtualized data source based on the provided data source,
   * max render item count, and batch size.
   */
  readonly virtualizedDataSource = computed(() => {
    const dataSource = this.dataSource();
    if (!dataSource) {
      return dataSource;
    }
    return new VirtualizedDataSource<T>(
      dataSource,
      this.maxRenderItemCount() ?? Infinity,
      this.batchSize() ?? 50
    );
  });

  /**
   * Emits loading state changes when data is being requested.
   */
  readonly loadingState = output<LoadingState>();

  /**
   * Constructs the SgTableScrollComponent and sets up scroll restoration logic.
   */
  constructor() {
    afterEveryRender({
      write: () => {
        if (this.lastRemovedCount > 0) {
          if (this.currentScrollDirection === 'previous') {
            const { previousFirstRow } = this;
            if (previousFirstRow) {
              previousFirstRow.nativeElement.scrollIntoView({ behavior: 'auto', block: 'end' });
            }
          } else if (this.currentScrollDirection === 'next') {
            const hostElement = this.hostRef.nativeElement;
            const isScrolledToBottom =
              hostElement.clientHeight + hostElement.scrollTop >= hostElement.scrollHeight;

            // Browsers like Safari automatically scroll to the bottom when adding new content.
            // As a result, we need to recalculate the correct scroll position and then jump
            // to that.
            if (isScrolledToBottom) {
              const rowElements = this.tableComponent?.rowElements;
              const lastIndex = rowElements?.length ?? -1;
              const previousLastIndex = lastIndex < 0 ? -1 : Math.max(0, lastIndex - this.lastRemovedCount - 1);
              const previousLastRow = previousLastIndex < 0 ? null : rowElements?.get(previousLastIndex);
              this.zone.runOutsideAngular(() => {
                requestAnimationFrame(() => {
                  if (previousLastRow != null) {
                    previousLastRow.nativeElement.scrollIntoView({ behavior: 'auto', block: 'end' });
                  }
                });
              });
            }
          }

          this.lastRemovedCount = 0;
        }
      }
    })
  }

  /**
   * Angular lifecycle hook. Initializes infinite scroll setup.
   */
  ngOnInit(): void {
    this.setupInfiniteScroll();
  }

  /**
   * Angular lifecycle hook. Checks if the first row has changed and updates reference.
   */
  ngAfterContentChecked(): void {
    const currentFirstRow = this.tableComponent?.rowElements?.get(0);
    // Check if the top-most row has actually changed
    if (currentFirstRow && currentFirstRow !== this.previousFirstRow) {
      // This is the guaranteed, correct top row.
      this.previousFirstRow = currentFirstRow;
    }
  }

  /**
   * Angular lifecycle hook. Cleans up subscriptions and observers on destroy.
   */
  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
    this.cleanupInfiniteScroll();
  }

  /**
   * Sets up infinite scroll by creating sentinels, observers, and scroll listeners.
   * @private
   */
  private setupInfiniteScroll(): void {
    const dataSource = untracked(this.virtualizedDataSource);
    if (!dataSource) {
      return;
    }

    dataSource.updates$.pipe(skip(1), distinctUntilChanged(), takeUntil(this.destroySubject))
      .subscribe(({ removedCount }) => {
        this.lastRemovedCount = removedCount;
      });

    const hostElement = this.hostRef.nativeElement as HTMLElement;
    let hasScrolled = false;
    const hostScrollListener = (event: Event) => {
      hasScrolled = true;
    };
    hostElement.addEventListener('scroll', hostScrollListener);
    this.hostScrollListener = hostScrollListener;

    const loadThresholdPercentTop = this.loadThresholdPercentTop() ?? 20;
    const loadThresholdPercentBottom = this.loadThresholdPercentBottom() ?? 20;
    const rootMargin = `${loadThresholdPercentTop}% 0px ${loadThresholdPercentBottom}% 0px`;
    const root = hostElement ?? null;

    // Create sentinel elements for intersection observation
    this.bottomSentinelElement = document.createElement('div');
    this.bottomSentinelElement.style.height = '1px';
    this.bottomSentinelElement.style.width = '100%';
    this.bottomSentinelElement.setAttribute('data-sg-sentinel', 'true');

    this.topSentinelElement = document.createElement('div');
    this.topSentinelElement.style.height = '1px';
    this.topSentinelElement.style.width = '100%';
    this.topSentinelElement.setAttribute('data-sg-sentinel', 'true');

    // Append sentinel to container
    if (hostElement.firstChild != null) {
      hostElement.insertBefore(this.topSentinelElement, hostElement.firstChild);
    }
    hostElement.appendChild(this.bottomSentinelElement);

    // Create IntersectionObserver
    this.intersectionObserver = new IntersectionObserver(
      (entries) => hasScrolled && this.handleIntersection(entries),
      {
        root,
        rootMargin,
        threshold: 0,
      }
    );

    this.intersectionObserver.observe(this.bottomSentinelElement);
    this.intersectionObserver.observe(this.topSentinelElement);
  }

  /**
   * Handles intersection events for the sentinel elements.
   * Triggers data requests when sentinels are intersected.
   * @param entries Array of IntersectionObserverEntry objects.
   * @private
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.requestData(entry.target === this.topSentinelElement ? 'previous' : 'next');
      }
    });
  }

  /**
   * Requests more data from the data source in the specified direction.
   * Emits loading state if a data load is triggered.
   * @param requesting The direction to load data ('next' or 'previous').
   * @returns Promise<void>
   * @private
   */
  private async requestData(requesting: SgTableLoadingDirection): Promise<void> {
    if (!this.dataSource) {
      return;
    }

    const dataSource = untracked(this.virtualizedDataSource);
    this.currentScrollDirection = requesting;
    if (dataSource?.loadMoreData(requesting)) {
      this.loadingState.emit({ requesting });
    }
  }

  /**
   * Cleans up infinite scroll observers, sentinels, and event listeners.
   * @private
   */
  private cleanupInfiniteScroll(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = undefined;
    }
    if (this.hostScrollListener) {
      this.hostRef.nativeElement.removeEventListener('scroll', this.hostScrollListener);
    }
    if (this.bottomSentinelElement) {
      this.bottomSentinelElement.remove();
      this.bottomSentinelElement = undefined;
    }
    if (this.topSentinelElement) {
      this.topSentinelElement.remove();
      this.topSentinelElement = undefined;
    }
  }
}

