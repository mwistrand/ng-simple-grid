export type SgTableLoadingDirection = 'next' | 'previous';

/**
 * Represents the loading state of the grid during data fetching operations.
 */
export interface SgTableLoadingState {
  requesting: SgTableLoadingDirection;
}

export type LoadingState = SgTableLoadingState;
