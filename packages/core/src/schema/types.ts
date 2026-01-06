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
  | { kind: "date"; value: string } // ISO date
  | { kind: "enum"; value: string }
  | { kind: "json"; value: unknown };

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
