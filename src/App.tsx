
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { LoginPage } from "@/pages/LoginPage";
import { RiderHome } from "@/pages/RiderHome";
import { RiderProfile } from "@/pages/RiderProfile";
import { MileageForm } from "@/pages/MileageForm";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { AdminReports } from "@/pages/AdminReports";
import { RiderDetails } from "@/pages/RiderDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
              <Navbar />
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                
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
              <MobileBottomNav />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
