import { ActorRef, Id, ISODateString } from "../shared/types";
import { CaseState } from "../workflow/types";

export type CaseEventId = Id;

export type CaseEvent =
  | {
      id: CaseEventId;
      caseId: Id;
      type: "case.created";
      actor: ActorRef;
      createdAt: ISODateString;
      payload: {
        title: string;
        description: string;
      };
    }
  | {
      id: CaseEventId;
      caseId: Id;
      type: "case.field.updated";
      actor: ActorRef;
      createdAt: ISODateString;
      payload: {
        key: string;
        previous: unknown;
        next: unknown;
      };
    }
  | {
      id: CaseEventId;
      caseId: Id;
      type: "case.state.changed";
      actor: ActorRef;
      createdAt: ISODateString;
      payload: {
        from: CaseState;
        to: CaseState;
        transitionId?: string;
        reason?: string;
      };
    }
  | {
      id: CaseEventId;
      caseId: Id;
      type: "suggestion.proposed";
      actor: ActorRef;
      createdAt: ISODateString;
      payload: {
        suggestionId: Id;
        kind: string;
      };
    }
  | {
      id: CaseEventId;
      caseId: Id;
      type: "suggestion.resolved";
      actor: ActorRef; // human
      createdAt: ISODateString;
      payload: {
        suggestionId: Id;
        status: "accepted" | "rejected";
      };
    };
