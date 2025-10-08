import { Directive, forwardRef } from '@angular/core';
import { CdkNoDataRow } from '@angular/cdk/table';

@Directive({
  selector: 'ng-template[sgNoDataRow]',
  providers: [{ provide: CdkNoDataRow, useExisting: forwardRef(() => SgNoDataRowDirective) }],
  host: {
    class: 'sg-no-data-row',
  },
})
export class SgNoDataRowDirective extends CdkNoDataRow {}
