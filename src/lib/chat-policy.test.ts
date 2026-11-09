import { describe, expect, it } from "bun:test";
import { chatErrorMessage } from "./chat-policy";
import { authenticateChat } from "./chat-auth.server";

describe("chat safety", () => {
  it("rejects a request without a session", async () => {
    expect(await authenticateChat(new Request("http://localhost/api/chat"))).toBeNull();
  });
  it("does not expose provider credentials in an error", () => {
    const secret = "private-test-credential";
    expect(chatErrorMessage(new Error(`API key ${secret} invalid`))).not.toContain(secret);
  });
  it("explains a temporary provider outage", () => {
    expect(chatErrorMessage(new Error("503 UNAVAILABLE"))).toContain("temporairement indisponible");
  });
});