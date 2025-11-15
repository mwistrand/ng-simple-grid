import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

/**
 * Manages expand/collapse state for row groups.
 * Injected automatically by SgTableComponent when grouping is enabled.
 */
@Injectable()
export class GroupStateService {
  private readonly expandedGroups = signal<Set<string>>(new Set());

  /**
   * Observable that emits when group state changes
   */
  readonly changes$: Observable<Set<string>> = toObservable(this.expandedGroups);

  /**
   * Check if a group is expanded
   */
  isExpanded(groupKey: string): boolean {
    return this.expandedGroups().has(groupKey);
  }

  /**
   * Toggle group expansion state
   */
  toggleGroup(groupKey: string): void {
    const current = new Set(this.expandedGroups());
    if (current.has(groupKey)) {
      current.delete(groupKey);
    } else {
      current.add(groupKey);
    }
    this.expandedGroups.set(current);
  }

  /**
   * Set expanded state for a group
   */
  setExpanded(groupKey: string, expanded: boolean): void {
    const current = new Set(this.expandedGroups());
    if (expanded) {
      current.add(groupKey);
    } else {
      current.delete(groupKey);
    }
    this.expandedGroups.set(current);
  }

  /**
   * Initialize groups (all expanded or all collapsed)
   */
  initializeGroups(groupKeys: string[], expanded: boolean): void {
    if (expanded) {
      this.expandedGroups.set(new Set(groupKeys));
    } else {
      this.expandedGroups.set(new Set());
    }
  }

  /**
   * Expand all groups
   */
  expandAll(groupKeys: string[]): void {
    this.expandedGroups.set(new Set(groupKeys));
  }

  /**
   * Collapse all groups
   */
  collapseAll(): void {
    this.expandedGroups.set(new Set());
  }

  /**
   * Reset state
   */
  reset(): void {
    this.expandedGroups.set(new Set());
  }
}
