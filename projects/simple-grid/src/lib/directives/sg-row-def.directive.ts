import { Directive, forwardRef } from '@angular/core';
import { CdkRowDef } from '@angular/cdk/table';

@Directive({
  selector: '[sgRowDef]',
  providers: [{ provide: CdkRowDef, useExisting: forwardRef(() => SgRowDefDirective) }],
  inputs: [
    {name: 'columns', alias: 'sgRowDefColumns'},
    {name: 'when', alias: 'sgRowDefWhen'},
  ],
  host: {
    class: 'sg-row-def',
  },
})
export class SgRowDefDirective extends CdkRowDef<any> {}
