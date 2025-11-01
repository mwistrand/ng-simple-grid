/**
 * Represents the width configuration for a column.
 */
export interface ColumnWidthConfig {
  /** Column identifier (matches sgColumnDef name) */
  columnId: string;
  /** Current width in pixels */
  width: number;
  /** Minimum width in pixels (default: 50) */
  minWidth?: number;
  /** Maximum width in pixels (default: none) */
  maxWidth?: number;
}

/**
 * Event payload emitted when column width changes.
 */
export interface ColumnWidthUpdate {
  /** The column identifier */
  columnId: string;
  /** The new width in pixels */
  width: number;
  /** The previous width in pixels */
  previousWidth: number;
}

/**
 * Configuration for column resizing behavior.
 */
export interface ColumnResizeConfig {
  /** Whether column resizing is enabled (default: false) */
  enabled?: boolean;
  /** Default minimum width for all columns in pixels (default: 50) */
  defaultMinWidth?: number;
  /** Default maximum width for all columns in pixels (default: none) */
  defaultMaxWidth?: number;
}
