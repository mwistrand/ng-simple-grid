import { NgModule } from '@angular/core';

import {
  SgTableScrollComponent,
  SgTableComponent,
  SgHeaderRowComponent,
  SgRowComponent,
  SgFooterRowComponent,
  SgGroupDialogComponent,
  SgRowGroupComponent,
  SgGroupHeaderRowComponent,
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
  SgGroupHeaderRowDefDirective,
} from './lib/directives';

const INCLUDED = [
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
  SgGroupDialogComponent,
  SgRowGroupComponent,
  SgGroupHeaderRowComponent,
  SgGroupHeaderRowDefDirective,
];

@NgModule({
  imports: INCLUDED,
  exports: [...INCLUDED],
})
export class SgTableModule {}
