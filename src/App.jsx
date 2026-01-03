import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "./components/AdminLayout";
import "./App.css"
import ServicesPage from "./components/Service";
import { ServiceProvider } from "./context/ServiceContext";
import { StaffProvider } from "./context/StaffContext";
import { AppointmentProvider } from "./context/AppointmentContext";
import { UserProvider } from "./context/UserContext";
import StaffPage from "./components/Staff";
import AppointmentPage from "./components/Appointment";
import DashboardPage from "./components/Dashboard";
import Login from "./pages/Login";


export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <ServiceProvider>
          <StaffProvider>
            <AppointmentProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/*" element={
                  <AdminLayout>
                    <Routes>
                      <Route path="/services" element={<ServicesPage />} />
                      <Route path="/staff" element={<StaffPage />} />
                      <Route path="/appointments" element={<AppointmentPage />} />
                      <Route path="/" element={<DashboardPage />} />
                    </Routes>
                  </AdminLayout>
                } />
              </Routes>
            </AppointmentProvider>
          </StaffProvider>
        </ServiceProvider>
      </UserProvider>
    </BrowserRouter>
  );
}
