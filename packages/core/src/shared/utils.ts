import { Id, ISODateTime } from "./types";

export const getCurrentISODateTime = (): ISODateTime => {
  return new Date().toISOString();
};

export const genererateId = <T extends Id>(): T => {
  // Simple unique ID generator (not for production use)
  return Math.random().toString(36).substr(2, 9) as T;
};
