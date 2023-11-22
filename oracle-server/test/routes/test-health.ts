import type { FastifyInstance } from "fastify";
import anyTest, { TestFn } from "ava";
import dotenv from "dotenv";
import path from "path";
import { makeApp } from "../../src/app.js";

const test = anyTest as TestFn<{ app: FastifyInstance | null }>;

test.beforeEach(async (t) => {
  dotenv.config({
    path: path.resolve(process.cwd(), ".env.test"),
    override: true,
  });

  const context = t.context;
  context.app = await makeApp({ logger: false });
});

test.afterEach.always(async (t) => {
  const context = t.context;
  context.app = null;
});

test("health check returns 200", async (t) => {
  if (!t.context.app) throw new Error("app not initialized");
  const response = await t.context.app.inject({
    method: "GET",
    url: "health-check",
  });
  t.is(response.statusCode, 200, "Sucess status code is returned.");
});
