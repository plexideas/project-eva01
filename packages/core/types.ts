type Case<S> = {
  id: string;
  title: string;
  description: string;
  state: S;
  fields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};

type CaseEvent = {
  id: string;
  caseId: string;
  type: string;
  payload: any;
  authorId: string;
  createdAt: Date;
};

type Suggestion = {
  id: string;
  caseId: string;
  kind: string;
  proposedValue: any;
  confidence: number;
  rationale: string;
  status: "proposed" | "accepted" | "rejected";
};

type WorkflowDefinition = {
  states: string[];
  transitions: {
    from: string;
    to: string;
    conditions?: string[];
  };
  initialState: string;
};

type FieldDefinition<T, O> = {
  name: string;
  type: T;
  required: boolean;
  constraints?: O[];
};
