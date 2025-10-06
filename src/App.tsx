import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Minerals from "./pages/Minerals";
import MineralPreview from "./pages/MineralPreview";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";
import { MineralForm } from "@/components/minerals/MineralForm";
import { TagForm } from "@/components/tags/TagForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          } />
          <Route path="/minerals" element={
            <MainLayout>
              <Minerals />
            </MainLayout>
          } />
          <Route path="/minerals/new" element={
            <MainLayout>
              <MineralForm />
            </MainLayout>
          } />
          <Route path="/minerals/:id/preview" element={
            <MainLayout>
              <MineralPreview />
            </MainLayout>
          } />
          <Route path="/minerals/:id/edit" element={
            <MainLayout>
              <MineralForm />
            </MainLayout>
          } />
          <Route path="/categories" element={
            <MainLayout>
              <Categories />
            </MainLayout>
          } />
          <Route path="/categories/new" element={
            <MainLayout>
              <TagForm />
            </MainLayout>
          } />
          <Route path="/categories/:id/edit" element={
            <MainLayout>
              <TagForm />
            </MainLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;