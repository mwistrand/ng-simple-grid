import { Directive, forwardRef } from '@angular/core';
import { CdkHeaderCellDef } from '@angular/cdk/table';

@Directive({
  selector: '[sgHeaderCellDef]',
  providers: [{ provide: CdkHeaderCellDef, useExisting: forwardRef(() => SgHeaderCellDefDirective) }],
  host: {
    class: 'sg-header-cell-def',
  },
})
export class SgHeaderCellDefDirective extends CdkHeaderCellDef {}
