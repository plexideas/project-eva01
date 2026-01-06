import { ISODateTime, JsonValue } from "../shared/types";

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "enum"
  | "json";

export type FieldValue =
  | string
  | number
  | boolean
  | null
  | ISODateTime
  | JsonValue;

export type FieldConstraint =
  | { type: "minLength"; value: number }
  | { type: "maxLength"; value: number }
  | { type: "min"; value: number }
  | { type: "max"; value: number }
  | { type: "pattern"; value: string }
  | { type: "oneOf"; values: string[] };

export type FieldDefinition = {
  key: string;
  label?: string;
  type: FieldType;
  required: boolean;
  constraints?: FieldConstraint[];
};
