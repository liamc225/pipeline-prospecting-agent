import test from "node:test";
import assert from "node:assert/strict";
import { validateDemoAccess } from "../lib/access";

test("validateDemoAccess allows localhost without token", () => {
  const result = validateDemoAccess({
    host: "localhost:3000",
    expectedToken: null,
    providedToken: null,
  });

  assert.equal(result, null);
});

test("validateDemoAccess blocks public host without configured token", () => {
  const result = validateDemoAccess({
    host: "demo.example.com",
    expectedToken: null,
    providedToken: null,
  });

  assert.deepEqual(result, {
    status: 403,
    error:
      "Public demo access is disabled. Set DEMO_ACCESS_TOKEN and provide it with the request.",
  });
});

test("validateDemoAccess requires matching configured token", () => {
  const result = validateDemoAccess({
    host: "demo.example.com",
    expectedToken: "secret",
    providedToken: "wrong",
  });

  assert.deepEqual(result, {
    status: 401,
    error: "Invalid demo token.",
  });
});

test("validateDemoAccess accepts matching configured token", () => {
  const result = validateDemoAccess({
    host: "demo.example.com",
    expectedToken: "secret",
    providedToken: "secret",
  });

  assert.equal(result, null);
});
