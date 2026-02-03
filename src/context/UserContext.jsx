import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [salons, setSalons] = useState([]);
  const [activeSalonId, setActiveSalonId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Base URL for the API
  const BASE_URL = "https://web-production-0344e.up.railway.app/api";

  const login = async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Fetch full profile to get salons
        await fetchUserProfile(data.token);
        
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const fetchUserProfile = async (authToken = token) => {
    if (!authToken) return;
    
    try {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Accept": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Handle salons
        if (data.salons && Array.isArray(data.salons)) {
          // The API returns an array of pivot objects { salon: {...}, role: ... }
          // We want to extract the salon details
          const formattedSalons = data.salons.map(item => ({
            ...item.salon,
            role: item.role, // Keep role info if needed
            pivotId: item.id
          }));
          
          setSalons(formattedSalons);
          
          // Set active salon if not set, or if current active is not in list
          if (formattedSalons.length > 0) {
            setActiveSalonId(prev => {
              const exists = formattedSalons.find(s => s.id === prev);
              return exists ? prev : formattedSalons[0].id;
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const addSalon = async (salonData) => {
    const result = await apiCall("salons", "POST", salonData);
    if (result.ok) {
      // Refresh profile to get updated list or manually add
      // The API returns { data: { ...salon } }
      const newSalon = result.data.data;
      setSalons(prev => [...prev, newSalon]);
      setActiveSalonId(newSalon.id); // Switch to new salon
      return { success: true, salon: newSalon };
    }
    return { success: false, message: result.error || "Failed to create salon" };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSalons([]);
    setActiveSalonId(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  /**
   * Reusable API call function
   * @param {string} endpoint - The API endpoint (e.g., '/services')
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {object} body - Request body for POST/PUT
   * @param {object} customHeaders - Additional headers (like X-Salon-Id)
   */
  const apiCall = async (endpoint, method = "GET", body = null, customHeaders = {}) => {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...customHeaders
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      // Ensure endpoint starts with / if not provided
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const response = await fetch(`${BASE_URL}${cleanEndpoint}`, config);
      
      // Handle 401 Unauthorized (token expired/invalid)
      if (response.status === 401) {
        logout();
        return { ok: false, status: 401, message: "Unauthorized" };
      }

      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.error("API Call Error:", error);
      return { ok: false, status: 500, error: error.message };
    }
  };

  // Load user from local storage on mount
  useEffect(() => {
    const initializeUser = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Fetch fresh data
          await fetchUserProfile(storedToken);
        } catch (e) {
          // If parsing fails, clear storage
          logout();
        }
      }
      setLoading(false);
    };

    initializeUser();
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      token, 
      salons,
      loading,
      activeSalonId,
      setActiveSalonId,
      addSalon,
      login, 
      logout, 
      apiCall, 
      isAuthenticated: !!token 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
