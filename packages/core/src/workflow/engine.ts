import { CaseCore, CaseId } from "../domain/case";
import { CaseEvent, CaseEventId } from "../domain/event";
import { ActorRef } from "../shared/types";
import { genererateId, getCurrentISODateTime } from "../shared/utils";
import { CaseState, Transition, WorkflowDefinition } from "./types";

type ValidateTransitionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: string;
    };

type ApplyTransitionResult =
  | {
      ok: true;
      nextCase: CaseCore;
      events: CaseEvent[];
    }
  | {
      ok: false;
      reason: string;
    };

export class WorkflowEngine {
  static #instance: WorkflowEngine;

  private workflowDefinition: WorkflowDefinition;

  private constructor(workflowDefinition: WorkflowDefinition) {
    this.workflowDefinition = workflowDefinition;
  }

  public static init(workflowDefinition: WorkflowDefinition): WorkflowEngine {
    if (!WorkflowEngine.#instance) {
      WorkflowEngine.#instance = new WorkflowEngine(workflowDefinition);
    }

    return WorkflowEngine.#instance;
  }

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.#instance) {
      throw new Error("Engine not initialized. Call Engine.init() first.");
    }
    return WorkflowEngine.#instance;
  }

  public validateTransition(
    from: CaseState,
    to: CaseState
  ): ValidateTransitionResult {
    if (!this.workflowDefinition.states.includes(from)) {
      return { ok: false, reason: `Invalid from state: ${from}` };
    }
    if (!this.workflowDefinition.states.includes(to)) {
      return { ok: false, reason: `Invalid to state: ${to}` };
    }
    if (
      !this.workflowDefinition.transitions.some(
        (t) => t.from === from && t.to === to
      )
    ) {
      return {
        ok: false,
        reason: `No valid transition from ${from} to ${to}`,
      };
    }
    return { ok: true };
  }

  public applyTransition(
    currentCase: CaseCore,
    transition: Transition,
    actor: ActorRef
  ): ApplyTransitionResult {
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

    const nextCase: CaseCore = {
      ...currentCase,
      state: transition.to,
      updatedAt: getCurrentISODateTime(),
    };

    const event: CaseEvent = {
      id: genererateId<CaseEventId>(),
      caseId: currentCase.id,
      type: "case.state.changed",
      actor,
      createdAt: getCurrentISODateTime(),
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
