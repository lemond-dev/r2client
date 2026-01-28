import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ToastContainer } from "@/components/ui/Toast";
import { TransferQueue } from "@/components/transfer/TransferQueue";
import { useThemeStore } from "@/stores/themeStore";

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <>
      <Layout />
      <TransferQueue />
      <ToastContainer />
    </>
  );
}

export default App;
