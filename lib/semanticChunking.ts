/**
 * Semantic Chunking Utility for RAG (Retrieval Augmented Generation)
 * Breaks large Excel datasets into manageable chunks for AI processing
 *
 * This is crucial for AI because:
 * - LLMs have limited context windows (can't process thousands of rows)
 * - We send only relevant data to avoid token overflow
 * - Faster processing = faster AI responses
 */

import type { ExcelSheet } from "@/lib/excelParser";

/**
 * A chunk of data with metadata for the AI to process
 */
export interface DataChunk {
  id: string; // Unique identifier for this chunk
  sheetName: string;
  columnNames: string[]; // Headers
  rows: Record<string, any>[]; // Data rows in this chunk
  rowIndices: [number, number]; // [start index, end index] in original sheet
  summary: string; // Human-readable summary of what's in this chunk
}

/**
 * Get column data types for smarter chunking
 * Example: "Name" is text, "Amount" is number
 */
function getColumnTypes(sheet: ExcelSheet): Record<string, string> {
  const types: Record<string, string> = {};

  for (const colName of sheet.columnNames) {
    // Sample first non-null value to determine type
    for (const row of sheet.rows) {
      const value = row[colName];
      if (value !== null && value !== undefined) {
        if (typeof value === "number") {
          types[colName] = "number";
        } else if (typeof value === "string") {
          types[colName] = "string";
        } else if (value instanceof Date) {
          types[colName] = "date";
        } else {
          types[colName] = "other";
        }
        break;
      }
    }

    // Default to string if no value found
    if (!types[colName]) {
      types[colName] = "string";
    }
  }

  return types;
}

/**
 * Create a human-readable summary of a data chunk
 * Used to help AI understand what's in this chunk without reading all rows
 */
function createChunkSummary(
  chunk: Omit<DataChunk, "summary">,
  types: Record<string, string>
): string {
  const rowCount = chunk.rows.length;
  const [startIdx, endIdx] = chunk.rowIndices;

  // Get min/max for numeric columns to help AI understand data range
  const ranges: string[] = [];
  for (const col of chunk.columnNames) {
    if (types[col] === "number") {
      const values = chunk.rows
        .map((r) => r[col])
        .filter((v) => typeof v === "number");
      if (values.length > 0) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        ranges.push(`${col}: ${min}-${max}`);
      }
    }
  }

  let summary = `Rows ${startIdx + 1}-${endIdx}: ${rowCount} records`;
  if (ranges.length > 0) {
    summary += `. Ranges: ${ranges.join(", ")}`;
  }

  return summary;
}

/**
 * Split a sheet into semantic chunks
 * Strategy: Group by logical size while respecting row boundaries
 *
 * @param sheet - The Excel sheet to chunk
 * @param maxRowsPerChunk - Maximum rows in each chunk (default: 100)
 * @returns Array of data chunks
 */
export function createSemanticChunks(
  sheet: ExcelSheet,
  maxRowsPerChunk: number = 100
): DataChunk[] {
  const chunks: DataChunk[] = [];
  const types = getColumnTypes(sheet);

  // Handle empty sheets
  if (sheet.rows.length === 0) {
    return chunks;
  }

  // Split rows into chunks of maxRowsPerChunk
  for (let startIdx = 0; startIdx < sheet.rows.length; startIdx += maxRowsPerChunk) {
    const endIdx = Math.min(startIdx + maxRowsPerChunk, sheet.rows.length);
    const chunkRows = sheet.rows.slice(startIdx, endIdx);

    const chunk: Omit<DataChunk, "summary"> = {
      id: `${sheet.name}-chunk-${chunks.length}`,
      sheetName: sheet.name,
      columnNames: sheet.columnNames,
      rows: chunkRows,
      rowIndices: [startIdx, endIdx - 1],
    };

    const summary = createChunkSummary(chunk, types);

    chunks.push({
      ...chunk,
      summary,
    });
  }

  return chunks;
}

/**
 * Search for relevant chunks based on column names mentioned in a query
 * Example: If user asks "What's the total sales?", find chunks with "sales" column
 *
 * @param chunks - All available chunks
 * @param query - User's question
 * @returns Most relevant chunk(s)
 */
export function findRelevantChunks(
  chunks: DataChunk[],
  query: string
): DataChunk[] {
  if (chunks.length === 0) {
    return [];
  }

  const queryLower = query.toLowerCase();
  const scores: [DataChunk, number][] = [];

  for (const chunk of chunks) {
    let score = 0;

    // Score based on matching column names
    for (const colName of chunk.columnNames) {
      if (queryLower.includes(colName.toLowerCase())) {
        score += 10; // Strong match
      }
      // Partial matches (e.g., "sal" matches "Sales")
      if (colName.toLowerCase().includes(queryLower.split(" ")[0])) {
        score += 5;
      }
    }

    // If no column matches, all chunks are equally relevant
    if (score === 0) {
      score = 1;
    }

    scores.push([chunk, score]);
  }

  // Sort by score (highest first) and return top 3
  return scores.sort((a, b) => b[1] - a[1]).slice(0, 3).map((item) => item[0]);
}

/**
 * Format chunks into a string that an AI can understand
 * This is what gets sent to the LLM
 *
 * @param chunks - Chunks to format
 * @param includeAllRows - If false, only show first 5 rows per chunk
 * @returns Formatted string
 */
export function formatChunksForAI(
  chunks: DataChunk[],
  includeAllRows: boolean = false
): string {
  if (chunks.length === 0) {
    return "No data available";
  }

  let formatted = "# Data Summary\n\n";

  for (const chunk of chunks) {
    formatted += `## ${chunk.sheetName} - ${chunk.summary}\n`;
    formatted += `Columns: ${chunk.columnNames.join(", ")}\n\n`;

    // Only show first 5 rows by default to save tokens
    const rowsToShow = includeAllRows ? chunk.rows : chunk.rows.slice(0, 5);

    // Create a simple text representation
    formatted += "Data sample:\n";
    for (const row of rowsToShow) {
      const values = chunk.columnNames.map((col) => {
        const val = row[col];
        return val !== undefined ? String(val).substring(0, 20) : "—";
      });
      formatted += `| ${values.join(" | ") } |\n`;
    }

    if (!includeAllRows && chunk.rows.length > 5) {
      formatted += `... and ${chunk.rows.length - 5} more rows\n`;
    }

    formatted += "\n";
  }

  return formatted;
}

/**
 * Get column names that are likely to be useful for analysis
 * Excludes ID columns and empty columns
 *
 * @param sheet - The sheet to analyze
 * @returns Useful column names
 */
export function getAnalyzableColumns(sheet: ExcelSheet): string[] {
  return sheet.columnNames.filter((col) => {
    // Skip ID columns
    if (col.toLowerCase().includes("id")) {
      return false;
    }

    // Skip columns that are mostly empty
    const nonEmptyCount = sheet.rows.filter(
      (row) => row[col] !== undefined && row[col] !== null && row[col] !== ""
    ).length;

    return nonEmptyCount / sheet.rows.length > 0.5; // At least 50% filled
  });
}

/**
 * Create a context summary that the AI should know about
 * This is prepended to every query for better understanding
 *
 * @param sheet - The sheet being analyzed
 * @returns Context string
 */
export function createContextSummary(sheet: ExcelSheet): string {
  if (sheet.rows.length === 0) {
    return "The sheet is empty.";
  }

  const analyzable = getAnalyzableColumns(sheet);
  const context =
    `You are analyzing a data sheet called "${sheet.name}" with ` +
    `${sheet.rows.length} rows and ${sheet.columnNames.length} columns. ` +
    `The main data columns are: ${analyzable.join(", ")}. ` +
    `Provide clear, actionable insights based on the data.`;

  return context;
}
