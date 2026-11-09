import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { chatErrorMessage } from "./chat-policy";
import { authenticateChat } from "./chat-auth.server";

describe("chat safety", () => {
  it("rejects a request without a session", async () => {
    assert.equal(await authenticateChat(new Request("http://localhost/api/chat")), null);
  });
  it("does not expose provider credentials in an error", () => {
    const secret = "private-test-credential";
    assert.equal(chatErrorMessage(new Error(`API key ${secret} invalid`)).includes(secret), false);
  });
  it("explains a temporary provider outage", () => {
    assert.equal(chatErrorMessage(new Error("503 UNAVAILABLE")).includes("temporairement indisponible"), true);
  });
});