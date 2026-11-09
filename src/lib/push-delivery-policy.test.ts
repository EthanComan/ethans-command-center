import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isExpiredPushStatus, shouldCompletePush } from "./push-delivery-policy";

describe("reminder delivery", () => {
  it("keeps a reminder pending if no device accepted it", () => {
    assert.equal(shouldCompletePush([]), false);
    assert.equal(shouldCompletePush([false, false]), false);
  });
  it("completes a reminder only after an accepted delivery", () => {
    assert.equal(shouldCompletePush([false, true]), true);
  });
  it("retains device registrations after temporary failures", () => {
    assert.equal(isExpiredPushStatus(503), false);
    assert.equal(isExpiredPushStatus(429), false);
    assert.equal(isExpiredPushStatus(410), true);
    assert.equal(isExpiredPushStatus(404), true);
  });
});