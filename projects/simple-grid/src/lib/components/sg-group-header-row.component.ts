import { Component, ChangeDetectionStrategy, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'sg-group-header-row, tr[sg-group-header-row]',
  template: '<ng-content />',
  exportAs: 'sgGroupHeaderRow',
  host: {
    class: 'sg-group-header-row',
    role: 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SgGroupHeaderRowComponent {
  readonly groupName = input<string>();
}
