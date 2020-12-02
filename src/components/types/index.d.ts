export interface block {
  position: {
    x: position;
    y: position;
  };
  merged: boolean;
  visible: boolean;
  removed: boolean;
  status: number;
  id: number;
  trapped: boolean
}

export interface player {
  status: block[];
  score: number;
  username: string;
  id: string;
}

export interface playerMove {
  id: string;
  username: string;
  score: number;
  blocks: block[];
  generatedBlock: block;
  mergedBlocks: [block, block, block][];
  type?: 1;
  handled: boolean;
  method: 1;
  perkTarget: string;
}

export interface reconnectInfo {
  id: string;
  username: string;
  gameMsg: playerMove;
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
