import { Component, ChangeDetectionStrategy, ViewEncapsulation, forwardRef } from '@angular/core';
import { CdkCellOutlet, CdkRow } from '@angular/cdk/table';

@Component({
  selector: 'sg-row, tr[sg-row]',
  template: '<ng-container cdkCellOutlet></ng-container>',
  exportAs: 'sgRow',
  host: {
    class: 'sg-row',
    role: 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: CdkRow, useExisting: forwardRef(() => SgRowComponent) }],
  imports: [CdkCellOutlet],
})
export class SgRowComponent extends CdkRow {}
