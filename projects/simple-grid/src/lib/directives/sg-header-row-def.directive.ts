import { Directive, booleanAttribute, forwardRef } from '@angular/core';
import { CdkHeaderRowDef } from '@angular/cdk/table';

@Directive({
  selector: '[sgHeaderRowDef]',
  providers: [{ provide: CdkHeaderRowDef, useExisting: forwardRef(() => SgHeaderRowDefDirective) }],
  inputs: [
    { name: 'columns', alias: 'sgHeaderRowDef' },
    { name: 'sticky', alias: 'sgHeaderRowDefSticky', transform: booleanAttribute },
  ],
  host: {
    class: 'sg-header-row-def',
  },
})
export class SgHeaderRowDefDirective extends CdkHeaderRowDef {}
