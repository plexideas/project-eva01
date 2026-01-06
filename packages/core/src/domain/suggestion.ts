import { ActorRef, Id, ISODateString } from "../shared/types";

export type SuggestionId = Id;

export type SuggestionKind =
  | "classify.category"
  | "extract.fields"
  | "summarize"
  | "next.step";

export type SuggestionStatus = "proposed" | "accepted" | "rejected";

export type Suggestion = {
  id: SuggestionId;
  caseId: Id;
  kind: SuggestionKind;
  proposedValue: unknown;
  confidence?: number;
  rationale?: string;
  status: SuggestionStatus;
  createdAt: ISODateString;
  createdBy: ActorRef;
};
