import { Id } from "../shared/types";

export type CaseState = string;

export type TransitionId = Id;

export type Transition = {
  id: TransitionId;
  from: CaseState;
  to: CaseState;
  conditions?: string[];
};

export type WorkflowDefinition = {
  version: string;
  initialState: CaseState;
  states: CaseState[];
  transitions: Transition[];
};
