import { Directive } from '@angular/core';
import { CdkCell } from '@angular/cdk/table';

@Directive({
  selector: 'sg-cell, td[sg-cell]',
  host: {
    class: 'sg-cell',
  },
})
export class SgCellDirective extends CdkCell {}
