import { Directive, forwardRef } from '@angular/core';
import { CdkRecycleRows } from '@angular/cdk/table';

@Directive({
  selector: 'sg-recycle-rows, [sgRecycleRows]',
  providers: [{ provide: CdkRecycleRows, useExisting: forwardRef(() => SgRecycleRowsDirective) }],
  host: {
    class: 'sg-recycle-rows',
  },
})
export class SgRecycleRowsDirective extends CdkRecycleRows {}
