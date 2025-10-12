import { Component, ChangeDetectionStrategy, ViewEncapsulation, forwardRef } from '@angular/core';
import { CdkCellOutlet, CdkHeaderRow } from '@angular/cdk/table';

@Component({
  selector: 'sg-header-row, tr[sg-header-row]',
  template: '<ng-container cdkCellOutlet></ng-container>',
  exportAs: 'sgHeaderRow',
  host: {
    class: 'sg-header-row',
    role: 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: CdkHeaderRow, useExisting: forwardRef(() => SgHeaderRowComponent) }],
  imports: [CdkCellOutlet],
})
export class SgHeaderRowComponent extends CdkHeaderRow {}
