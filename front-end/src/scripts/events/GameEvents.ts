export const REMATCH_REQUEST = 'rematch:request';
export const REMATCH_RESPONSE = 'rematch:response';

export interface RematchRequestEvent extends CustomEvent<void> {
  type: typeof REMATCH_REQUEST;
}

export interface RematchResponseEvent extends CustomEvent<boolean> {
  type: typeof REMATCH_RESPONSE;
}

declare global {
  interface DocumentEventMap {
    [REMATCH_REQUEST]: RematchRequestEvent;
    [REMATCH_RESPONSE]: RematchResponseEvent;
  }
}
