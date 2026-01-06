import { FieldValue } from "../schema/types";
import { Id, ISODateTime } from "../shared/types";
import { CaseState } from "../workflow/types";

export type CaseId = Id;

export type CaseCore = {
  id: CaseId;
  title: string;
  description: string;
  state: CaseState;
  fields: Record<string, FieldValue>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
