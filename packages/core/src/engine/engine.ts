import { CaseCore } from "../domain/case";
import { CaseEvent } from "../domain/event";
import { FieldDefinition, FieldValue } from "../schema/types";
import { isValueOfType } from "../schema/validation";
import { ActorRef, Id, ISODateTime } from "../shared/types";
import { CaseState, TransitionId, WorkflowDefinition } from "../workflow/types";

type FieldUpdateError =
  | { code: "UNKNOWN_FIELD"; key: string }
  | { code: "REQUIRED_FIELD_CANNOT_BE_NULL"; key: string }
  | {
      code: "INVALID_FIELD_TYPE";
      key: string;
      expected: string;
      actual: string;
    }
  | {
      code: "CONSTRAINT_VIOLATION";
      key: string;
      constraint: string;
      details?: unknown;
    }
  | { code: "NO_CHANGE"; key: string };

type TransitionError =
  | { code: "UNKNOWN_STATE"; state: string }
  | { code: "UNKNOWN_TRANSITION"; transitionId: string }
  | { code: "INVALID_TRANSITION"; from: string; to: string }
  | { code: "STATE_MISMATCH"; expected: string; actual: string };

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

export type FieldUpdateResult =
  | { ok: true; nextCase: CaseCore; events: CaseEvent[] }
  | { ok: false; reason: FieldUpdateError };

type EngineDeps = {
  now: () => ISODateTime;
  newId: () => Id;
};

type EngineOptions = {
  fields?: FieldDefinition[];
  unknownFieldPolicy?: "allow" | "reject";
};

export class Engine {
  private workflowDefinition: WorkflowDefinition;
  private now: () => ISODateTime;
  private newId: () => Id;
  private fields: FieldDefinition[] = [];
  private unknownFieldPolicy: "allow" | "reject" = "allow";

  public constructor(
    workflowDefinition: WorkflowDefinition,
    deps: EngineDeps,
    options?: EngineOptions
  ) {
    this.workflowDefinition = workflowDefinition;
    this.now = deps.now;
    this.newId = deps.newId;
    if (options?.fields) {
      this.fields = options.fields;
    }
    if (options?.unknownFieldPolicy) {
      this.unknownFieldPolicy = options.unknownFieldPolicy;
    }
  }

  private validateFieldUpdate(
    key: string,
    value: FieldValue
  ): { ok: true } | { ok: false; reason: FieldUpdateError } {
    const fieldDef = this.fields.find((f) => f.key === key);

    if (!fieldDef) {
      if (this.unknownFieldPolicy === "reject") {
        return { ok: false, reason: { code: "UNKNOWN_FIELD", key } };
      } else {
        return { ok: true };
      }
    }

    if (value === null || value === undefined) {
      if (fieldDef.required) {
        return {
          ok: false,
          reason: { code: "REQUIRED_FIELD_CANNOT_BE_NULL", key },
        };
      } else {
        return { ok: true };
      }
    }

    if (isValueOfType(value, fieldDef.type) === false) {
      return {
        ok: false,
        reason: {
          code: "INVALID_FIELD_TYPE",
          key,
          expected: fieldDef.type,
          actual: typeof value,
        },
      };
    }

    // Additional type and constraint validations can be added here

    return { ok: true };
  }

  public validateTransition(
    from: CaseState,
    to: CaseState
  ): ValidateTransitionResult {
    if (!this.workflowDefinition.states.includes(from)) {
      return { ok: false, reason: { code: "UNKNOWN_STATE", state: from } };
    }
    if (!this.workflowDefinition.states.includes(to)) {
      return { ok: false, reason: { code: "UNKNOWN_STATE", state: to } };
    }
    if (
      !this.workflowDefinition.transitions.some(
        (t) => t.from === from && t.to === to
      )
    ) {
      return {
        ok: false,
        reason: { code: "INVALID_TRANSITION", from, to },
      };
    }
    return { ok: true };
  }

  public applyTransition(
    currentCase: CaseCore,
    transitionId: TransitionId,
    actor: ActorRef
  ): ApplyTransitionResult {
    const transition = this.workflowDefinition.transitions.find(
      (t) => t.id === transitionId
    );

    if (!transition) {
      return {
        ok: false,
        reason: {
          code: "UNKNOWN_TRANSITION",
          transitionId: transitionId,
        },
      };
    }

    if (currentCase.state !== transition.from) {
      return {
        ok: false,
        reason: {
          code: "STATE_MISMATCH",
          expected: transition.from,
          actual: currentCase.state,
        },
      };
    }

    const validation = this.validateTransition(
      currentCase.state,
      transition.to
    );

    if (!validation.ok) {
      return validation;
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

  public applyFieldUpdate(
    currentCase: CaseCore,
    key: string,
    nextValue: FieldValue,
    actor: ActorRef
  ): FieldUpdateResult {
    const validation = this.validateFieldUpdate(key, nextValue);

    if (!validation.ok) {
      return validation;
    }

    const previousValue = currentCase.fields[key];

    if (Object.is(previousValue, nextValue)) {
      return {
        ok: false,
        reason: { code: "NO_CHANGE", key },
      };
    }

    const ts = this.now();

    const nextCase: CaseCore = {
      ...currentCase,
      fields: {
        ...currentCase.fields,
        [key]: nextValue,
      },
      updatedAt: ts,
    };

    const event: CaseEvent = {
      id: this.newId(),
      caseId: currentCase.id,
      type: "case.field.updated",
      actor,
      createdAt: ts,
      payload: {
        key,
        previous: previousValue,
        next: nextValue,
      },
    };

    return {
      ok: true,
      nextCase,
      events: [event],
    };
  }
}
