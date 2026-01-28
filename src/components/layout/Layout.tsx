import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { StatusBar } from "./StatusBar";
import { FileExplorer } from "@/components/file/FileExplorer";

export function Layout() {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* File Explorer */}
        <main className="flex-1 overflow-hidden">
          <FileExplorer />
        </main>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
