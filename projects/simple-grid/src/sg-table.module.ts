import { NgModule } from '@angular/core';

import {
  SgColumnResizerComponent,
  SgTableScrollComponent,
  SgTableComponent,
  SgHeaderRowComponent,
  SgRowComponent,
  SgFooterRowComponent,
} from './lib/components';
import {
  SgColumnDefDirective,
  SgHeaderCellDefDirective,
  SgCellDefDirective,
  SgHeaderRowDefDirective,
  SgRowDefDirective,
  SgHeaderCellDirective,
  SgCellDirective,
  SgFooterCellDefDirective,
  SgFooterCellDirective,
  SgFooterRowDefDirective,
  SgNoDataRowDirective,
  SgRecycleRowsDirective,
} from './lib/directives';
import { UnwrapGroupedRowPipe } from './lib/pipes';

const INCLUDED = [
  SgColumnResizerComponent,
  SgTableScrollComponent,
  SgTableComponent,
  SgColumnDefDirective,
  SgHeaderCellDefDirective,
  SgCellDefDirective,
  SgHeaderRowDefDirective,
  SgRowDefDirective,
  SgHeaderCellDirective,
  SgCellDirective,
  SgFooterCellDefDirective,
  SgFooterCellDirective,
  SgFooterRowDefDirective,
  SgNoDataRowDirective,
  SgRecycleRowsDirective,
  SgHeaderRowComponent,
  SgRowComponent,
  SgFooterRowComponent,
  UnwrapGroupedRowPipe,
];

@NgModule({
  imports: INCLUDED,
  exports: [...INCLUDED],
})
export class SgTableModule {}
