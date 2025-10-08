import { Directive } from '@angular/core';
import { CdkFooterCell } from '@angular/cdk/table';

@Directive({
  selector: 'sg-footer-cell, td[sg-footer-cell]',
  host: {
    class: 'sg-footer-cell',
  },
})
export class SgFooterCellDirective extends CdkFooterCell {}
