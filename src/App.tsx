import { AppProviders } from "@/providers";
import { KanbanBoard } from "@/components";

const App = () => {
  return (
    <AppProviders>
      <KanbanBoard />
    </AppProviders>
  );
};

export default App;
