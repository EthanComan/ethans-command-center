import { describe, expect, it } from "bun:test";
import { isExpiredPushStatus, shouldCompletePush } from "./push-delivery-policy";

describe("reminder delivery", () => {
  it("keeps a reminder pending if no device accepted it", () => {
    expect(shouldCompletePush([])).toBe(false);
    expect(shouldCompletePush([false, false])).toBe(false);
  });
  it("completes a reminder only after an accepted delivery", () => {
    expect(shouldCompletePush([false, true])).toBe(true);
  });
  it("retains device registrations after temporary failures", () => {
    expect(isExpiredPushStatus(503)).toBe(false);
    expect(isExpiredPushStatus(429)).toBe(false);
    expect(isExpiredPushStatus(410)).toBe(true);
    expect(isExpiredPushStatus(404)).toBe(true);
  });
});