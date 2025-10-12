import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Minerals from "./pages/Minerals";
import MineralPreview from "./pages/MineralPreview";
import Categories from "./pages/Categories";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { MineralForm } from "@/components/minerals/MineralForm";
import { TagForm } from "@/components/tags/TagForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/minerals" element={
              <ProtectedRoute>
                <MainLayout>
                  <Minerals />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/minerals/new" element={
              <ProtectedRoute>
                <MainLayout>
                  <MineralForm />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/minerals/:id/preview" element={
              <ProtectedRoute>
                <MainLayout>
                  <MineralPreview />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/minerals/:id/edit" element={
              <ProtectedRoute>
                <MainLayout>
                  <MineralForm />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/categories" element={
              <ProtectedRoute>
                <MainLayout>
                  <Categories />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/categories/new" element={
              <ProtectedRoute>
                <MainLayout>
                  <TagForm />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/categories/:id/edit" element={
              <ProtectedRoute>
                <MainLayout>
                  <TagForm />
                </MainLayout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;