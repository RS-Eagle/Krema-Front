import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";

const StaffContext = createContext();

export function StaffProvider({ children }) {
  const { apiCall, activeSalonId } = useUser();
  const [allStaff, setAllStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (activeSalonId) {
      fetchStaff();
    } else {
      setAllStaff([]);
    }
  }, [activeSalonId]);

  const fetchStaff = async () => {
    if (!activeSalonId) return;
    setLoading(true);
    
    // GET /api/catalog/staff with X-Salon-Id header
    // We fetch all staff (active and inactive) to allow client-side filtering
    const result = await apiCall("catalog/staff", "GET", null, {
      "X-Salon-Id": activeSalonId
    });

    if (result.ok) {
      const staffData = Array.isArray(result.data) ? result.data : (result.data.data || []);
      setAllStaff(staffData);
    }
    setLoading(false);
  };

  // --- Actions ---

  const addStaff = async (newStaffData) => {
    if (!activeSalonId) return { success: false, message: "No active salon selected" };

    const result = await apiCall("catalog/staff", "POST", newStaffData, {
      "X-Salon-Id": activeSalonId
    });

    if (result.ok) {
      const newStaff = result.data.data;
      setAllStaff((prev) => [newStaff, ...prev]);
      return { success: true, staff: newStaff };
    }
    return { success: false, message: result.error || "Failed to add staff" };
  };

  const updateStaff = async (id, updatedFields) => {
    const result = await apiCall(`catalog/staff/${id}`, "PATCH", updatedFields, {
      "X-Salon-Id": activeSalonId
    });

    if (result.ok) {
      setAllStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
      );
      return { success: true };
    }
    return { success: false };
  };

  const deleteStaff = async (id) => {
    const result = await apiCall(`catalog/staff/${id}`, "DELETE", null, {
      "X-Salon-Id": activeSalonId
    });

    if (result.ok) {
      setAllStaff((prev) => prev.filter(s => s.id !== id));
      return { success: true };
    }
    return { success: false };
  };

  return (
    <StaffContext.Provider
      value={{
        allStaff, 
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        addStaff,
        updateStaff,
        deleteStaff,
        loading,
        refreshStaff: fetchStaff
      }}
    >
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  return useContext(StaffContext);
}