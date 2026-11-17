import { test } from "node:test";
import assert from "node:assert/strict";
import { authErrorMessage, isManagedOAuthHost } from "./auth-errors.ts";

test("mauvais identifiants traduits", () => {
  assert.equal(authErrorMessage("Invalid login credentials"), "Email ou mot de passe incorrect.");
});
test("Google géré seulement sur les adresses Lovable", () => {
  assert.equal(isManagedOAuthHost("ethans-command-center.lovable.app"), true);
  assert.equal(isManagedOAuthHost("localhost"), false);
  assert.equal(isManagedOAuthHost("ethan.vercel.app"), false);
});
