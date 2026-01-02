import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "./components/AdminLayout";
import "./App.css"
import ServicesPage from "./components/Service";
import { ServiceProvider } from "./context/ServiceContext";
import { StaffProvider } from "./context/StaffContext";
import { UserProvider } from "./context/UserContext";
import StaffPage from "./components/Staff";
import DashboardPage from "./components/Dashboard";
import Login from "./pages/Login";


export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <ServiceProvider>
          <StaffProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/*" element={
                <AdminLayout>
                  <Routes>
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/staff" element={<StaffPage />} />
                    <Route path="/" element={<DashboardPage />} />
                  </Routes>
                </AdminLayout>
              } />
            </Routes>
          </StaffProvider>
        </ServiceProvider>
      </UserProvider>
    </BrowserRouter>
  );
}
