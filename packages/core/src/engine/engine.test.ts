import { describe, expect, it } from "vitest";
import type { WorkflowDefinition } from "../workflow/types";
import type { CaseCore } from "../domain/case";
import type { ActorRef } from "../shared/types";
import { Engine } from "./engine";

describe("applyTransition", () => {
  const wf: WorkflowDefinition = {
    version: "1",
    initialState: "new",
    states: ["new", "triage"],
    transitions: [{ id: "t1", from: "new", to: "triage" }],
  };

  const fixedNow = "2026-01-06T10:00:00.000Z";
  const deps = {
    now: () => fixedNow,
    newId: () => "evt-1",
  };

  const engine = new Engine(wf, deps);

  const actor: ActorRef = { type: "human", id: "u1" };

  const c: CaseCore = {
    id: "c1",
    title: "t",
    description: "d",
    state: "new",
    fields: {},
    createdAt: "2026-01-06T09:00:00.000Z",
    updatedAt: "2026-01-06T09:00:00.000Z",
  };

  it("creates a state change event and updates updatedAt using single timestamp", () => {
    const transition = wf.transitions[0]!;

    const r = engine.applyTransition(c, transition.id, actor);
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    expect(r.nextCase.state).toBe("triage");
    expect(r.nextCase.updatedAt).toBe(fixedNow);

    expect(r.events).toHaveLength(1);
    const e = r.events[0]!;

    expect(e.type).toBe("case.state.changed");
    expect(e.createdAt).toBe(fixedNow);
    expect(e.caseId).toBe("c1");
    expect(e.actor).toEqual(actor);

    if (e.type === "case.state.changed") {
      expect(e.payload.from).toBe("new");
      expect(e.payload.to).toBe("triage");
      expect(e.payload.transitionId).toBe("t1");
    }
  });
});

describe("applyFieldUpdate", () => {
  const wf: WorkflowDefinition = {
    version: "1",
    initialState: "new",
    states: ["new", "triage"],
    transitions: [{ id: "t1", from: "new", to: "triage" }],
  };

  const deps = {
    now: () => "2026-01-07T10:00:00.000Z",
    newId: () => "evt-1",
  };

  const strictEngine = new Engine(wf, deps, {
    fields: [
      { key: "category", type: "string", required: false },
      {
        key: "priority",
        type: "string",
        required: true,
      },
    ],
    unknownFieldPolicy: "reject",
  });

  const actor: ActorRef = { type: "human", id: "u1" };

  const c: CaseCore = {
    id: "c1",
    title: "t",
    description: "d",
    state: "new",
    fields: { category: "billing" },
    createdAt: "2026-01-07T09:00:00.000Z",
    updatedAt: "2026-01-07T09:00:00.000Z",
  };

  it("updates field, bumps updatedAt and emits event", () => {
    const r = strictEngine.applyFieldUpdate(c, "category", "access", actor);
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    expect(r.nextCase.fields.category).toBe("access");
    expect(r.nextCase.updatedAt).toBe("2026-01-07T10:00:00.000Z");

    expect(r.events).toHaveLength(1);
    const e = r.events[0]!;
    expect(e.type).toBe("case.field.updated");
    expect(e.createdAt).toBe("2026-01-07T10:00:00.000Z");
    if (e.type === "case.field.updated") {
      expect(e.payload.key).toBe("category");
      expect(e.payload.previous).toBe("billing");
      expect(e.payload.next).toBe("access");
    }
  });

  it("returns NO_CHANGE when value is identical", () => {
    const r = strictEngine.applyFieldUpdate(c, "category", "billing", actor);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason.code).toBe("NO_CHANGE");
  });

  it("return UNKNOWN_FIELD for unknown field", () => {
    const r = strictEngine.applyFieldUpdate(c, "unknown", "value", actor);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason.code).toBe("UNKNOWN_FIELD");
    expect(r.reason.key).toBe("unknown");
  });

  it("returns REQUIRED_FIELD_CANNOT_BE_NULL for null on required field", () => {
    const r = strictEngine.applyFieldUpdate(c, "priority", null, actor);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason.code).toBe("REQUIRED_FIELD_CANNOT_BE_NULL");
    expect(r.reason.key).toBe("priority");
  });

  it("allows null on non-required field", () => {
    const r = strictEngine.applyFieldUpdate(c, "category", null, actor);
    expect(r.ok).toBe(true);
  });

  it("return INVALID_FIELD_TYPE for wrong type", () => {
    const r = strictEngine.applyFieldUpdate(c, "priority", 123, actor);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason.code).toBe("INVALID_FIELD_TYPE");
    expect(r.reason.key).toBe("priority");
  });

  it("allows unknown fields when policy is 'allow'", () => {
    const lenientEngine = new Engine(wf, deps, {
      fields: [],
      unknownFieldPolicy: "allow",
    });

    const r = lenientEngine.applyFieldUpdate(c, "unknownField", 42, actor);
    expect(r.ok).toBe(true);
  });

  it("allows unknown fields when policy is not set", () => {
    const lenientEngine = new Engine(wf, deps, {
      fields: [],
    });

    const r = lenientEngine.applyFieldUpdate(c, "unknownField", 42, actor);
    expect(r.ok).toBe(true);
  });
});
