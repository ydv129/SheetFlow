/**
 * Excel parsing utilities using SheetJS
 * Converts Excel .xlsx files into JSON format
 * Runs entirely in the browser - no data sent to server
 */

import * as XLSX from "xlsx";

/**
 * Represents a single sheet from an Excel workbook
 */
export interface ExcelSheet {
  name: string; // Sheet name (e.g., "Sales Data")
  rows: Record<string, any>[]; // Array of rows, each row is an object with column headers as keys
  columnNames: string[]; // List of column headers
  rowCount: number; // Total number of data rows
}

/**
 * Represents the entire Excel workbook
 */
export interface ExcelWorkbook {
  fileName: string;
  sheets: ExcelSheet[];
  sheetCount: number;
}

/**
 * Parse an Excel file from a File object
 * @param file - The Excel file to parse
 * @returns Parsed workbook data
 */
export async function parseExcelFile(file: File): Promise<ExcelWorkbook> {
  // Validate that it's actually an Excel file
  if (!isValidExcelFile(file)) {
    throw new Error("File must be an .xlsx or .xls Excel file");
  }

  try {
    // Read the file as an array buffer
    const buffer = await file.arrayBuffer();

    // Parse the Excel file using SheetJS
    const workbook = XLSX.read(buffer, { type: "array" });

    // Extract sheet information
    const sheets = workbook.SheetNames.map((sheetName) => {
      // Get the actual sheet object
      const worksheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON format
      // This turns rows into objects with column headers as keys
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

      // Get column names from the first row
      const columnNames =
        rows.length > 0 ? Object.keys(rows[0] as Record<string, any>) : [];

      return {
        name: sheetName,
        rows,
        columnNames,
        rowCount: rows.length,
      };
    });

    return {
      fileName: file.name,
      sheets,
      sheetCount: sheets.length,
    };
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Check if a file is a valid Excel file
 * @param file - File to validate
 * @returns True if file is .xlsx or .xls
 */
function isValidExcelFile(file: File): boolean {
  // Check file extension
  const validExtensions = [".xlsx", ".xls", ".xlsm"];
  const hasValidExtension = validExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  // Also check MIME type just to be safe
  const validMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/vnd.ms-excel.sheet.macroEnabled.12",
  ];
  const hasValidMimeType = validMimeTypes.includes(file.type);

  return hasValidExtension || hasValidMimeType;
}

/**
 * Get a specific sheet from parsed workbook
 * @param workbook - The parsed workbook
 * @param sheetIndex - Index of the sheet (0-based)
 * @returns The specific sheet
 */
export function getSheet(workbook: ExcelWorkbook, sheetIndex: number): ExcelSheet | undefined {
  if (sheetIndex < 0 || sheetIndex >= workbook.sheets.length) {
    return undefined;
  }
  return workbook.sheets[sheetIndex];
}

/**
 * Get a specific sheet by name
 * @param workbook - The parsed workbook
 * @param sheetName - Name of the sheet
 * @returns The specific sheet
 */
export function getSheetByName(
  workbook: ExcelWorkbook,
  sheetName: string
): ExcelSheet | undefined {
  return workbook.sheets.find((sheet) => sheet.name === sheetName);
}

/**
 * Filter rows from a sheet based on a predicate
 * Useful for searching or filtering data
 * @param sheet - The sheet to filter
 * @param predicate - Function that returns true for rows to keep
 * @returns Filtered rows
 */
export function filterSheetRows(
  sheet: ExcelSheet,
  predicate: (row: Record<string, any>, index: number) => boolean
): Record<string, any>[] {
  return sheet.rows.filter(predicate);
}

/**
 * Get a subset of rows (for pagination or sampling)
 * @param sheet - The sheet
 * @param startIndex - Starting row index
 * @param limit - Number of rows to return
 * @returns Subset of rows
 */
export function getRowsSlice(
  sheet: ExcelSheet,
  startIndex: number,
  limit: number
): Record<string, any>[] {
  return sheet.rows.slice(startIndex, startIndex + limit);
}

/**
 * Get column data (all values in a specific column)
 * @param sheet - The sheet
 * @param columnName - Name of the column
 * @returns Array of values from that column
 */
export function getColumnData(
  sheet: ExcelSheet,
  columnName: string
): any[] {
  return sheet.rows.map((row) => row[columnName]).filter((val) => val !== undefined);
}

/**
 * Get basic statistics about a sheet
 * Useful for understanding the data at a glance
 */
export function getSheetStats(sheet: ExcelSheet) {
  return {
    sheetName: sheet.name,
    rowCount: sheet.rowCount,
    columnCount: sheet.columnNames.length,
    columnNames: sheet.columnNames,
  };
}
