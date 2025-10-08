import { Directive, forwardRef } from '@angular/core';
import { CdkCellDef } from '@angular/cdk/table';

@Directive({
  selector: '[sgCellDef]',
  providers: [{ provide: CdkCellDef, useExisting: forwardRef(() => SgCellDefDirective) }],
  host: {
    class: 'sg-cell-def',
  },
})
export class SgCellDefDirective extends CdkCellDef {}
