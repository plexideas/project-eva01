import { FieldType, FieldValue } from "./types";

export function isValueOfType(value: FieldValue, type: FieldType): boolean {
  switch (type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number";
    case "boolean":
      return typeof value === "boolean";
    case "date":
      return typeof value === "string" && !isNaN(Date.parse(value));
    case "json":
      return true; // Assume any value is valid JSON
    default:
      return false;
  }
}
