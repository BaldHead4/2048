export interface block {
  position: {
    x: position;
    y: position;
  };
  merged: boolean;
  status: number;
  id: number;
}

export interface players {
  status: block[];
  score: number;
  username: string;
  id: string;
}

export type AjaxMethod =
  | "get"
  | "GET"
  | "delete"
  | "DELETE"
  | "head"
  | "HEAD"
  | "options"
  | "OPTIONS"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "patch"
  | "PATCH"
  | "purge"
  | "PURGE"
  | "link"
  | "LINK"
  | "unlink"
  | "UNLINK";

export type position = 0 | 1 | 2 | 3;

export type playerIndex = 0 | 1 | 2 | 3;
