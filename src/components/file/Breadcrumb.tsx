import { ChevronRight, Home } from "lucide-react";
import { useBucketStore } from "@/stores/bucketStore";
import { cn } from "@/lib/utils";

export function Breadcrumb() {
  const { selectedBucket, currentPath, setCurrentPath } = useBucketStore();

  const pathParts = currentPath ? currentPath.split("/").filter(Boolean) : [];

  const handleNavigate = (index: number) => {
    if (index === -1) {
      setCurrentPath("");
    } else {
      const newPath = pathParts.slice(0, index + 1).join("/");
      setCurrentPath(newPath);
    }
  };

  return (
    <div className="flex items-center gap-1 border-b border-border bg-muted/30 px-4 py-2">
      {/* Bucket / Home */}
      <button
        onClick={() => handleNavigate(-1)}
        className={cn(
          "flex items-center gap-1.5 rounded px-2 py-1",
          "text-sm font-medium transition-colors",
          pathParts.length === 0
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Home className="h-4 w-4" />
        <span>{selectedBucket}</span>
      </button>

      {/* Path Parts */}
      {pathParts.map((part, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => handleNavigate(index)}
            className={cn(
              "rounded px-2 py-1 text-sm transition-colors",
              index === pathParts.length - 1
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {part}
          </button>
        </div>
      ))}
    </div>
  );
}
