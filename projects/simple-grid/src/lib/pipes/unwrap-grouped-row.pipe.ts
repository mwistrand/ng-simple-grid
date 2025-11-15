import { Pipe, PipeTransform } from '@angular/core';
import { unwrapGroupedRow } from '../models/group-config';

/**
 * Pipe to unwrap grouped rows to get original data.
 * Use this in cell templates when grouping may be enabled.
 *
 * Usage:
 * ```html
 * <td sg-cell *sgCellDef="let row">
 *   {{ (row | unwrapGroupedRow).name }}
 * </td>
 * ```
 */
@Pipe({
  name: 'unwrapGroupedRow',
  standalone: true,
  pure: true,
})
export class UnwrapGroupedRowPipe implements PipeTransform {
  transform(row: any): any {
    return unwrapGroupedRow(row);
  }
}
