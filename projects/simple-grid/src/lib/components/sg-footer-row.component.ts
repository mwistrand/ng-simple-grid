import { Component, ChangeDetectionStrategy, ViewEncapsulation, forwardRef } from '@angular/core';
import { CdkCellOutlet, CdkFooterRow } from '@angular/cdk/table';

@Component({
  selector: 'sg-footer-row, tr[sg-footer-row]',
  template: '<ng-container cdkCellOutlet></ng-container>',
  exportAs: 'sgFooterRow',
  host: {
    class: 'sg-footer-row',
    role: 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: CdkFooterRow, useExisting: forwardRef(() => SgFooterRowComponent) }],
  imports: [CdkCellOutlet],
})
export class SgFooterRowComponent extends CdkFooterRow {}
