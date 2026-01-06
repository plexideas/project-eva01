import { ActorRef, Id, ISODateTime } from "../shared/types";
import { CaseState } from "../workflow/types";
import { CaseId } from "./case";
import { SuggestionKind } from "./suggestion";

export type CaseEventId = Id;

export type CaseEvent =
  | {
      id: CaseEventId;
      caseId: CaseId;
      type: "case.created";
      actor: ActorRef;
      createdAt: ISODateTime;
      payload: {
        title: string;
        description: string;
      };
    }
  | {
      id: CaseEventId;
      caseId: CaseId;
      type: "case.field.updated";
      actor: ActorRef;
      createdAt: ISODateTime;
      payload: {
        key: string;
        previous: unknown;
        next: unknown;
      };
    }
  | {
      id: CaseEventId;
      caseId: CaseId;
      type: "case.state.changed";
      actor: ActorRef;
      createdAt: ISODateTime;
      payload: {
        from: CaseState;
        to: CaseState;
        transitionId?: string;
        reason?: string;
      };
    }
  | {
      id: CaseEventId;
      caseId: CaseId;
      type: "suggestion.proposed";
      actor: ActorRef;
      createdAt: ISODateTime;
      payload: {
        suggestionId: SuggestionKind;
        kind: string;
      };
    }
  | {
      id: CaseEventId;
      caseId: CaseId;
      type: "suggestion.resolved";
      actor: ActorRef; // human
      createdAt: ISODateTime;
      payload: {
        suggestionId: Id;
        status: "accepted" | "rejected";
      };
    };
