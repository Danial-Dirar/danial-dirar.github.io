"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { clearVault, unlockVault, type StoredVault } from "@/lib/admin/vault";

/**
 * Returning visit: the password decrypts the stored token. There is no
 * comparison to pass — a wrong password simply fails to decrypt, which is why
 * this is worth anything at all on a static site.
 */
export function UnlockForm({
  vault,
  onUnlocked,
  onForget,
}: {
  vault: StoredVault;
  onUnlocked: (token: string) => void;
  onForget: () => void;
}) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      onUnlocked(await unlockVault(vault, password));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlock failed.");
      setPassword("");
    } finally {
      setBusy(false);
    }
  }

  function handleForget() {
    if (
      !confirm(
        "Remove the stored token from this device? You will need the token again to set it up.",
      )
    ) {
      return;
    }
    clearVault();
    onForget();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-sm">
      <label
        className="mb-1.5 block font-mono text-[11px] text-muted-foreground"
        htmlFor="password"
      >
        password
      </label>
      <input
        id="password"
        type="password"
        className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:border-primary"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        autoFocus
        required
      />

      {error && (
        <p className="mt-2 font-mono text-[13px] text-destructive">{error}</p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "Unlocking…" : "Unlock"}
        </Button>
        <button
          type="button"
          onClick={handleForget}
          className="font-mono text-[12px] text-muted-foreground hover:text-destructive"
        >
          forget this device
        </button>
      </div>

      <p className="mt-4 font-mono text-[11px] text-muted-foreground">
        {vault.owner}/{vault.repo} · {vault.branch}
      </p>
    </form>
  );
}
