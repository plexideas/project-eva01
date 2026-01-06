import { ActorRef, Id, ISODateTime } from "../shared/types";
import { CaseId } from "./case";

export type SuggestionId = Id;

export type SuggestionKind =
  | "classify.category"
  | "extract.fields"
  | "summarize"
  | "next.step";

export type SuggestionStatus = "proposed" | "accepted" | "rejected";

export type Suggestion = {
  id: SuggestionId;
  caseId: CaseId;
  kind: SuggestionKind;
  proposedValue: unknown;
  confidence?: number;
  rationale?: string;
  status: SuggestionStatus;
  createdAt: ISODateTime;
  createdBy: ActorRef;
};
