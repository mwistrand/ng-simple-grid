import { Directive } from '@angular/core';
import { CdkHeaderCell } from '@angular/cdk/table';

@Directive({
  selector: 'sg-header-cell, th[sg-header-cell]',
  host: {
    class: 'sg-header-cell',
    role: 'columnheader',
  },
})
export class SgHeaderCellDirective extends CdkHeaderCell {}
