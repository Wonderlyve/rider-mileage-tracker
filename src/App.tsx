
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AuthPage } from "@/pages/AuthPage";
import { RiderHome } from "@/pages/RiderHome";
import { RiderProfile } from "@/pages/RiderProfile";
import { MileageForm } from "@/pages/MileageForm";
import { EquipmentForm } from "@/pages/EquipmentForm";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { AdminReports } from "@/pages/AdminReports";
import { RiderDetails } from "@/pages/RiderDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={
          user ? (
            user.type === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/rider/home" replace />
            )
          ) : (
            <Navigate to="/auth" replace />
          )
        } />
        <Route path="/auth" element={
          user ? (
            user.type === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/rider/home" replace />
            )
          ) : (
            <AuthPage />
          )
        } />
        
        {/* Rider Routes */}
        <Route path="/rider/home" element={
          <PrivateRoute requiredType="rider">
            <RiderHome />
          </PrivateRoute>
        } />
        <Route path="/rider/profile" element={
          <PrivateRoute requiredType="rider">
            <RiderProfile />
          </PrivateRoute>
        } />
        <Route path="/rider/entry" element={
          <PrivateRoute requiredType="rider">
            <MileageForm />
          </PrivateRoute>
        } />
        <Route path="/rider/equipment" element={
          <PrivateRoute requiredType="rider">
            <EquipmentForm />
          </PrivateRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <PrivateRoute requiredType="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/reports" element={
          <PrivateRoute requiredType="admin">
            <AdminReports />
          </PrivateRoute>
        } />
        <Route path="/admin/rider/:id" element={
          <PrivateRoute requiredType="admin">
            <RiderDetails />
          </PrivateRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && <MobileBottomNav />}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
