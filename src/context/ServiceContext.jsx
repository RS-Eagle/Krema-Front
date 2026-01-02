import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";

const ServiceContext = createContext();

export function ServiceProvider({ children }) {
  const { apiCall, activeSalonId } = useUser();
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(false);

  // View State
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch services when activeSalonId changes
  useEffect(() => {
    if (activeSalonId) {
      fetchServices();
    } else {
      setAllServices([]);
    }
  }, [activeSalonId]);

  const fetchServices = async () => {
    if (!activeSalonId) return;
    
    setLoading(true);
    const result = await apiCall("catalog/services", "GET", null, {
      "X-Salon-Id": activeSalonId
    });

    if (result.ok) {
      const servicesData = Array.isArray(result.data) ? result.data : (result.data.data || []);
      setAllServices(servicesData);
    }
    setLoading(false);
  };

  // Derived state: Filter services
  const services = allServices.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === "active") matchesStatus = service.is_active === true;
    if (filterStatus === "inactive") matchesStatus = service.is_active === false;
    
    return matchesSearch && matchesStatus;
  });

  // --- Actions ---

  const addService = async (newServiceData) => {
    if (!activeSalonId) return { success: false, message: "No active salon selected" };

    const result = await apiCall("catalog/services", "POST", newServiceData, {
      "X-Salon-Id": activeSalonId
    });

    if (result.ok) {
      const newService = result.data.data;
      setAllServices((prev) => [newService, ...prev]);
      return { success: true, service: newService };
    }
    return { success: false, message: result.error || "Failed to create service" };
  };

  const updateService = async (id, updatedFields) => {
    const result = await apiCall(`catalog/services/${id}`, "PATCH", updatedFields, {
      "X-Salon-Id": activeSalonId
    });

    if (result.ok) {
      setAllServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
      );
      return { success: true };
    }
    return { success: false };
  };

  const deleteService = async (id) => {
    const result = await apiCall(`catalog/services/${id}`, "DELETE", null, {
      "X-Salon-Id": activeSalonId
    });

    if (result.ok) {
      setAllServices((prev) => prev.filter(s => s.id !== id));
      return { success: true };
    }
    return { success: false };
  };

  return (
    <ServiceContext.Provider
      value={{
        services,
        allServices,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        addService,
        updateService,
        deleteService,
        loading,
        refreshServices: fetchServices
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  return useContext(ServiceContext);
}