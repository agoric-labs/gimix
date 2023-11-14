import type { Token } from "@fastify/oauth2";

type MemoryStore = Map<string, Token>;

let memoryStore: MemoryStore | undefined;

/**
 * Simple in-memory store for persisting access tokens
 */
export function getStore(): MemoryStore {
  if (!memoryStore) memoryStore = new Map();
  return memoryStore;
}

export async function saveAccessToken(token: Token) {
  getStore().set(token.refresh_token as string, token);
}

export async function retrieveAccessToken(token: Token["refresh_token"]) {
  if (token && token.startsWith("Bearer ")) {
    token = token.substring(6);
  }

  if (token && getStore().has(token)) {
    return getStore().get(token);
  }
  throw new Error("Invalid refresh token");
}
