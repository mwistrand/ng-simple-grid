import { Directive, forwardRef, Input } from '@angular/core';
import { CdkColumnDef } from '@angular/cdk/table';

@Directive({
  selector: '[sgColumnDef]',
  providers: [{ provide: CdkColumnDef, useExisting: forwardRef(() => SgColumnDefDirective) }],
  host: {
    class: 'sg-column-def',
  },
})
export class SgColumnDefDirective extends CdkColumnDef {
  @Input('sgColumnDef')
  override get name(): string {
    return this._name;
  }
  override set name(name: string) {
    this._setNameInput(name);
  }
}
