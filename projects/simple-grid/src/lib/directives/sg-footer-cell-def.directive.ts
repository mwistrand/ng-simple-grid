import { Directive, forwardRef } from '@angular/core';
import { CdkFooterCellDef } from '@angular/cdk/table';

@Directive({
  selector: '[sgFooterCellDef]',
  providers: [
    { provide: CdkFooterCellDef, useExisting: forwardRef(() => SgFooterCellDefDirective) },
  ],
  host: {
    class: 'sg-footer-cell-def',
  },
})
export class SgFooterCellDefDirective extends CdkFooterCellDef {}
