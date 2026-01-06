import { CaseCore } from "../domain/case";
import { CaseEvent } from "../domain/event";
import { ActorRef, Id, ISODateTime } from "../shared/types";
import { CaseState, Transition, WorkflowDefinition } from "./types";

type TransitionError =
  | { code: "unknown_state"; state: string }
  | { code: "unknown_transition"; from: string; to: string };

type ValidateTransitionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: TransitionError;
    };

type ApplyTransitionResult =
  | {
      ok: true;
      nextCase: CaseCore;
      events: CaseEvent[];
    }
  | {
      ok: false;
      reason: TransitionError;
    };

type WorkflowEngineDeps = {
  now: () => ISODateTime;
  newId: () => Id;
};

export class WorkflowEngine {
  private workflowDefinition: WorkflowDefinition;
  private now: () => ISODateTime;
  private newId: () => Id;

  public constructor(
    workflowDefinition: WorkflowDefinition,
    deps: WorkflowEngineDeps
  ) {
    this.workflowDefinition = workflowDefinition;
    this.now = deps.now;
    this.newId = deps.newId;
  }

  public validateTransition(
    from: CaseState,
    to: CaseState
  ): ValidateTransitionResult {
    if (!this.workflowDefinition.states.includes(from)) {
      return { ok: false, reason: { code: "unknown_state", state: from } };
    }
    if (!this.workflowDefinition.states.includes(to)) {
      return { ok: false, reason: { code: "unknown_state", state: to } };
    }
    if (
      !this.workflowDefinition.transitions.some(
        (t) => t.from === from && t.to === to
      )
    ) {
      return {
        ok: false,
        reason: { code: "unknown_transition", from, to },
      };
    }
    return { ok: true };
  }

  public applyTransition(
    currentCase: CaseCore,
    transition: Transition,
    actor: ActorRef
  ): ApplyTransitionResult {
    if (currentCase.state !== transition.from) {
      return {
        ok: false,
        reason: {
          code: "unknown_transition",
          from: currentCase.state,
          to: transition.to,
        },
      };
    }

    const validation = this.validateTransition(
      currentCase.state,
      transition.to
    );

    if (!validation.ok) {
      return {
        ok: false,
        reason: validation.reason,
      };
    }

    const ts = this.now();

    const nextCase: CaseCore = {
      ...currentCase,
      state: transition.to,
      updatedAt: ts,
    };

    const event: CaseEvent = {
      id: this.newId(),
      caseId: currentCase.id,
      type: "case.state.changed",
      actor,
      createdAt: ts,
      payload: {
        from: currentCase.state,
        to: transition.to,
        transitionId: transition.id,
      },
    };

    return {
      ok: true,
      nextCase,
      events: [event],
    };
  }
}
