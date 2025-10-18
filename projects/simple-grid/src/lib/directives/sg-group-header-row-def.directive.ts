import { Directive, input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[sgGroupHeaderRowDef]',
  host: {
    class: 'sg-group-header-row-def',
  },
})
export class SgGroupHeaderRowDefDirective {
  readonly template = input.required<TemplateRef<any>>({ alias: 'sgGroupHeaderRowDef' });

  constructor(public templateRef: TemplateRef<any>) {}
}
