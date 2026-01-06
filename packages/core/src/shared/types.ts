export type Id = string;

export type ISODateString = string;

export type ActorType = "human" | "system" | "ai";

export type ActorRef =
  | { type: "human"; id: Id }
  | { type: "system"; id: Id }
  | { type: "ai"; id: Id };
