import { NgModule } from '@angular/core';

import {
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
} from './lib/directives'

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
];

@NgModule({
  imports: INCLUDED,
  exports: [...INCLUDED]
})
export class SgTableModule {}
