import { useState, useEffect } from "react";
import { Plus, Database, ChevronRight, Loader2 } from "lucide-react";
import { useBucketStore, type Bucket } from "@/stores/bucketStore";
import { useR2 } from "@/hooks/useR2";
import { cn } from "@/lib/utils";
import { AddAccountDialog } from "@/components/bucket/AddAccountDialog";

export function Sidebar() {
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [loadingAccountId, setLoadingAccountId] = useState<string | null>(null);

  const {
    accounts,
    buckets,
    selectedAccountId,
    selectedBucket,
    selectAccount,
    selectBucket,
  } = useBucketStore();

  const { loadBuckets } = useR2();

  // Load buckets when account is selected
  const handleSelectAccount = async (accountId: string) => {
    selectAccount(accountId);
    setLoadingAccountId(accountId);
    try {
      await loadBuckets(accountId);
    } finally {
      setLoadingAccountId(null);
    }
  };

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex h-10 items-center justify-between border-b border-border px-3">
        <span className="text-xs font-medium text-muted-foreground">存储桶</span>
        <button
          onClick={() => setIsAddAccountOpen(true)}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded",
            "text-muted-foreground hover:bg-accent hover:text-foreground",
            "transition-colors"
          )}
          title="添加账户"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Account & Bucket List */}
      <div className="flex-1 overflow-y-auto p-2">
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Database className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">暂无账户</p>
            <button
              onClick={() => setIsAddAccountOpen(true)}
              className="mt-3 text-xs text-primary hover:underline"
            >
              添加第一个账户
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {accounts.map((account) => (
              <AccountItem
                key={account.id}
                account={account}
                isSelected={selectedAccountId === account.id}
                isLoading={loadingAccountId === account.id}
                selectedBucket={selectedBucket}
                buckets={buckets.filter((b) => b.accountId === account.id)}
                onSelect={() => handleSelectAccount(account.id)}
                onSelectBucket={selectBucket}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Account Dialog */}
      <AddAccountDialog
        open={isAddAccountOpen}
        onOpenChange={setIsAddAccountOpen}
      />
    </aside>
  );
}

interface AccountItemProps {
  account: { id: string; name: string };
  isSelected: boolean;
  isLoading: boolean;
  selectedBucket: string | null;
  buckets: Bucket[];
  onSelect: () => void;
  onSelectBucket: (name: string) => void;
}

function AccountItem({
  account,
  isSelected,
  isLoading,
  selectedBucket,
  buckets,
  onSelect,
  onSelectBucket,
}: AccountItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto expand when selected
  useEffect(() => {
    if (isSelected) {
      setIsExpanded(true);
    }
  }, [isSelected]);

  return (
    <div>
      {/* Account Header */}
      <button
        onClick={() => {
          if (!isSelected) {
            onSelect();
          }
          setIsExpanded(!isExpanded);
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5",
          "text-sm transition-colors",
          isSelected
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-90"
            )}
          />
        )}
        <span className="flex-1 truncate text-left font-medium">
          {account.name}
        </span>
      </button>

      {/* Bucket List */}
      {isExpanded && !isLoading && (
        <div className="ml-4 mt-1 space-y-0.5">
          {buckets.map((bucket) => (
            <BucketItem
              key={bucket.name}
              bucket={bucket}
              isSelected={selectedBucket === bucket.name}
              onSelect={() => onSelectBucket(bucket.name)}
            />
          ))}
          {buckets.length === 0 && (
            <p className="px-2 py-1 text-xs text-muted-foreground">
              暂无存储桶
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface BucketItemProps {
  bucket: Bucket;
  isSelected: boolean;
  onSelect: () => void;
}

function BucketItem({ bucket, isSelected, onSelect }: BucketItemProps) {
  // 为每个桶生成一个固定的渐变色
  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-amber-500",
    "from-green-500 to-emerald-500",
    "from-red-500 to-rose-500",
    "from-indigo-500 to-violet-500",
  ];
  const gradientIndex =
    bucket.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    gradients.length;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5",
        "text-sm transition-colors",
        isSelected
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <div
        className={cn(
          "h-3 w-3 rounded-sm bg-gradient-to-br",
          gradients[gradientIndex]
        )}
      />
      <span className="flex-1 truncate text-left">{bucket.name}</span>
    </button>
  );
}
