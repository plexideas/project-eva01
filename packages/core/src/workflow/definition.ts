import { CaseCore } from "../domain/case";
import { CaseEvent } from "../domain/event";
import { ActorRef } from "../shared/types";
import { CaseState, Transition } from "./types";

type ValidateTransitionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: string;
    };

export function validateTransition(
  workflow: WorkflowDefinition,
  from: CaseState,
  to: CaseState
): ValidateTransitionResult {
  return { ok: true };
}

type ApplyTransitionResult = {
  nextCase: CaseCore;
  events: CaseEvent[];
};

export function applyTransition(
  currentCase: CaseCore,
  transition: Transition,
  actor: ActorRef
): ApplyTransitionResult {
  return {
    nextCase: { ...currentCase, state: transition.to },
    events: [],
  };
}
