import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";

const AppointmentContext = createContext();

export function AppointmentProvider({ children }) {
  const { apiCall, activeSalonId } = useUser();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch appointments when activeSalonId changes
  useEffect(() => {
    if (activeSalonId) {
      fetchAppointments();
    } else {
      setAppointments([]);
    }
  }, [activeSalonId]);

  const fetchAppointments = async (filters = {}) => {
    if (!activeSalonId) return;
    
    setLoading(true);
    setError(null);

    // Construct query string from filters
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.staff_id) queryParams.append("staff_id", filters.staff_id);
    if (filters.from) queryParams.append("from", filters.from);
    if (filters.to) queryParams.append("to", filters.to);

    const queryString = queryParams.toString();
    const endpoint = `appointments${queryString ? `?${queryString}` : ""}`;

    const result = await apiCall(endpoint, "GET", null, {
      "X-Salon-Id": activeSalonId
    });
    console.log(endpoint,activeSalonId)

    if (result.ok) {
      // The API returns { data: { current_page: 1, data: [...], total: 1 } }
      // or sometimes just { data: [...] } depending on pagination.
      // Based on the prompt: { data: { current_page: 1, data: [...], total: 1 } }
      const appointmentsData = result.data.data?.data || []; 
      setAppointments(appointmentsData);
      console.log(appointmentsData)
      console.log(result)
    } else {
      setError(result.message || "Failed to fetch appointments");
    }
    setLoading(false);
  };

  const createAppointment = async (appointmentData) => {
    if (!activeSalonId) return { success: false, message: "No active salon selected" };

    setLoading(true);
    const result = await apiCall("appointments", "POST", appointmentData, {
      "X-Salon-Id": activeSalonId
    });
    console.log(appointmentData)
    setLoading(false);

    if (result.ok) {
      // Add the new appointment to the list
      // The API returns { data: { ...appointment } }
      const newAppointment = result.data.data;
      setAppointments((prev) => [newAppointment, ...prev]);
      return { success: true, data: newAppointment };
    } else {
      const errorMessage = result.data?.message || result.message || "Failed to create appointment";
      const errors = result.data?.errors;
      return { success: false, message: errorMessage, errors };
    }
  };

  const rescheduleAppointment = async (id, rescheduleData) => {
    if (!activeSalonId) return { success: false, message: "No active salon selected" };

    setLoading(true);
    const result = await apiCall(`appointments/${id}/reschedule`, "POST", rescheduleData, {
      "X-Salon-Id": activeSalonId
    });
    setLoading(false);

    if (result.ok) {
      // Update the appointment in the list
      // Assuming the API returns the updated appointment or we need to refresh
      // The prompt doesn't specify the response for reschedule, but usually it returns the updated object.
      // If not, we might need to re-fetch or manually update the fields.
      // Let's assume it returns the updated data structure similar to create.
      // If the response structure is different, we might need to adjust.
      // For now, let's re-fetch to be safe or update if we get data back.
      
      // Optimistic update or re-fetch? Let's try to update if data is present.
      if (result.data && result.data.data) {
         const updatedAppointment = result.data.data;
         setAppointments((prev) => prev.map(app => app.id === id ? updatedAppointment : app));
      } else {
         // Fallback: re-fetch
         fetchAppointments();
      }
      
      return { success: true };
    } else {
      return { success: false, message: result.message || "Failed to reschedule appointment" };
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    if (!activeSalonId) return { success: false, message: "No active salon selected" };

    setLoading(true);
    const result = await apiCall(`appointments/${id}/status`, "POST", { status }, {
      "X-Salon-Id": activeSalonId
    });
    setLoading(false);

    if (result.ok) {
      // Update local state
      setAppointments((prev) => prev.map(app => 
        app.id === id ? { ...app, status: status } : app
      ));
      return { success: true };
    } else {
      return { success: false, message: result.message || "Failed to update status" };
    }
  };

  return (
    <AppointmentContext.Provider value={{
      appointments,
      loading,
      error,
      fetchAppointments,
      createAppointment,
      rescheduleAppointment,
      updateAppointmentStatus
    }}>
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointment() {
  return useContext(AppointmentContext);
}
