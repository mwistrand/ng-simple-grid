import { Directive, booleanAttribute, forwardRef } from '@angular/core';
import { CdkFooterRowDef } from '@angular/cdk/table';

@Directive({
  selector: '[sgFooterRowDef]',
  providers: [{ provide: CdkFooterRowDef, useExisting: forwardRef(() => SgFooterRowDefDirective) }],
  inputs: [
    { name: 'columns', alias: 'sgFooterRowDef' },
    { name: 'sticky', alias: 'sgFooterRowDefSticky', transform: booleanAttribute },
  ],
  host: {
    class: 'sg-footer-row-def',
  },
})
export class SgFooterRowDefDirective extends CdkFooterRowDef {}
