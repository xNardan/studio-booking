import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BookingPage from "./pages/Booking";
import AdminAvailability from "./pages/AdminAvailability";
import AdminBookings from "./pages/AdminBookings";
import AdminUsers from "./pages/AdminUsers";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/ThemeProvider";
import PrivacyPolicy from "./components/PrivacyPolicy";
import CookieConsent from "./components/CookieConsent";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" attribute="class">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/rezerwacja" element={<BookingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminAvailability />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/bookings" 
              element={
                <ProtectedRoute>
                  <AdminBookings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;