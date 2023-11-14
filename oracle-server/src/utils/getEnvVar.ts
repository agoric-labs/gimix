import type { ProcessEnv } from "../index.d.ts";

export const getEnvVar = (key: keyof ProcessEnv) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} not set`);
  return value;
};

export const getEnvVars = (keys: (keyof ProcessEnv)[]) =>
  keys.reduce((acc, curr, i) => {
    acc[i] = getEnvVar(curr);
    return acc;
  }, [] as string[]);
