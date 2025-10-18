import { Component, ChangeDetectionStrategy, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'sg-row-group, tbody[sg-row-group]',
  template: '<ng-content />',
  exportAs: 'sgRowGroup',
  host: {
    class: 'sg-row-group',
    role: 'rowgroup',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SgRowGroupComponent {
  readonly groupKey = input<string>();
  readonly groupName = input<string>();
}
