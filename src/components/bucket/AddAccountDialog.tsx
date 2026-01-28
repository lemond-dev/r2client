import { useState } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { useBucketStore } from "@/stores/bucketStore";
import * as api from "@/lib/tauri";
import { cn } from "@/lib/utils";

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAccountDialog({ open, onOpenChange }: AddAccountDialogProps) {
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { addAccount } = useBucketStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !accountId || !accessKeyId || !secretAccessKey) {
      setError("请填写所有字段");
      return;
    }

    setIsLoading(true);

    try {
      // Validate credentials first
      await api.validateCredentials(accountId, accessKeyId, secretAccessKey);

      const id = crypto.randomUUID();

      // Save to backend (secure storage)
      await api.saveAccount(id, name, accountId, accessKeyId, secretAccessKey);

      // Add to local store
      addAccount({
        id,
        name,
        accountId,
        accessKeyId,
        secretAccessKey,
      });

      // Reset form
      setName("");
      setAccountId("");
      setAccessKeyId("");
      setSecretAccessKey("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isLoading && onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        <h2 className="mb-4 text-lg font-semibold">添加 R2 账户</h2>

        {/* Help Text */}
        <p className="mb-4 text-xs text-muted-foreground">
          在 Cloudflare Dashboard &gt; R2 &gt; Manage R2 API Tokens 中创建 API Token
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              账户名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：我的 R2 账户"
              disabled={isLoading}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-2",
                "text-sm placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                "disabled:opacity-50"
              )}
            />
          </div>

          {/* Account ID */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Account ID
            </label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="Cloudflare Account ID"
              disabled={isLoading}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-2",
                "text-sm font-mono placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                "disabled:opacity-50"
              )}
            />
          </div>

          {/* Access Key ID */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Access Key ID
            </label>
            <input
              type="text"
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              placeholder="R2 Access Key ID"
              disabled={isLoading}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-2",
                "text-sm font-mono placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                "disabled:opacity-50"
              )}
            />
          </div>

          {/* Secret Access Key */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Secret Access Key
            </label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={secretAccessKey}
                onChange={(e) => setSecretAccessKey(e.target.value)}
                placeholder="R2 Secret Access Key"
                disabled={isLoading}
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-2 pr-10",
                  "text-sm font-mono placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring",
                  "disabled:opacity-50"
                )}
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium",
                "text-muted-foreground hover:bg-accent hover:text-foreground",
                "transition-colors disabled:opacity-50"
              )}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "验证中..." : "添加"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
