"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { checkAccess } from "@/lib/admin/github";
import {
  MIN_PASSWORD_LENGTH,
  createVault,
  type RepoTarget,
} from "@/lib/admin/vault";
import { site } from "@/lib/site";

const DEFAULT_OWNER = site.social.github.split("/").pop() ?? "";

const inputClass =
  "w-full rounded-lg border border-border/60 bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:border-primary";
const labelClass = "mb-1.5 block font-mono text-[11px] text-muted-foreground";

/**
 * First run on a device: take a password and a token, store the token encrypted
 * under the password. The token is verified against the GitHub API first, so a
 * bad token fails here rather than at the first publish.
 */
export function SetupForm({ onReady }: { onReady: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [token, setToken] = useState("");
  const [owner, setOwner] = useState(DEFAULT_OWNER);
  const [repo, setRepo] = useState("danial-dirar.github.io");
  const [branch, setBranch] = useState("main");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    const target: RepoTarget = {
      owner: owner.trim(),
      repo: repo.trim(),
      branch: branch.trim() || "main",
    };
    const trimmedToken = token.trim();

    setBusy(true);
    try {
      await checkAccess(trimmedToken, target);
      await createVault(password, trimmedToken, target);
      onReady(trimmedToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
      <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-[13px] leading-relaxed text-muted-foreground">
        <p>
          This device has no credentials yet. Create a fine-grained token at{" "}
          <a
            href="https://github.com/settings/personal-access-tokens/new"
            target="_blank"
            rel="noreferrer noopener"
            className="text-primary hover:underline"
          >
            github.com/settings/personal-access-tokens
          </a>{" "}
          with access to only this repository and{" "}
          <span className="text-foreground">Contents: Read and write</span>.
        </p>
        <p className="mt-2">
          The token is encrypted with your password before it is stored. Your
          password is never saved anywhere — lose it and you set this up again.
        </p>
      </div>

      <div>
        <label className={labelClass} htmlFor="token">
          github token
        </label>
        <input
          id="token"
          type="password"
          className={inputClass}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="github_pat_…"
          autoComplete="off"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="owner">
            owner
          </label>
          <input
            id="owner"
            className={inputClass}
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="repo">
            repo
          </label>
          <input
            id="repo"
            className={inputClass}
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="branch">
            branch
          </label>
          <input
            id="branch"
            className={inputClass}
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="password">
            password ({MIN_PASSWORD_LENGTH}+ characters)
          </label>
          <input
            id="password"
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="confirm">
            confirm password
          </label>
          <input
            id="confirm"
            type="password"
            className={inputClass}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      {error && <p className="font-mono text-[13px] text-destructive">{error}</p>}

      <div>
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "Verifying token…" : "Save & unlock"}
        </Button>
      </div>
    </form>
  );
}
