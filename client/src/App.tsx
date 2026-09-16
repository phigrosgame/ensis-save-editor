import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster theme="dark" position="bottom-right" />
        <Home />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
