import { NavLink, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
// 1. Import the hook
import {
  LayoutDashboard,
  Scissors,
  CalendarDays,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
  Store,
  Check,
  LogOut,
  Plus,
  X,
  Loader2
} from "lucide-react";
import { useUser } from "../context/UserContext";

export default function AdminLayout({ children }) {
  // 2. Consume Global State from UserContext
  const { salons, activeSalonId, setActiveSalonId, user, logout, addSalon, isAuthenticated } = useUser();
  const [isAddSalonOpen, setIsAddSalonOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Derive the full salon object based on the global ID
  const activeSalon = salons.find((s) => s.id === activeSalonId) || salons[0] || { name: "Select Salon" };

  // Navigation Config
  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    {
      label: "Management",
      icon: Scissors,
      children: [
        { to: "/services", label: "Service List" },
        { to: "/staff", label: "Staff & Members", icon: Users },
      ],
    },
    { to: "/appointments", label: "Appointments", icon: CalendarDays },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white  flex flex-col shadow-sm z-20">
        <div className="h-16 flex items-center justify-center ">
          <span className="text-xl font-bold text-gray-800 tracking-tight">
            Krema.ba
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <NavItem key={index} item={item} />
          ))}
        </nav>
        <div className="flex justify-center items-center mb-2 cursor-pointer" onClick={logout}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium  bg-gray-50 text-gray-900 transition-all duration-300 hover:bg-blue-600 hover:*:text-white">
            <>
              <LogOut
                size={18}
                className="text-gray-900 "
              />

              <span>Log out</span>
            </>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white  flex items-center justify-between px-6 shadow-sm z-10">
          {/* Custom Salon Dropdown */}
          <SalonSelector
            salons={salons}
            activeSalon={activeSalon}
            // Pass the global setter
            onSalonSelect={(id) => setActiveSalonId(id)}
            onAddSalonClick={() => setIsAddSalonOpen(true)}
          />

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-700">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-gray-400">{user?.email}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "AU"}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Add Salon Modal */}
      <AddSalonModal 
        isOpen={isAddSalonOpen} 
        onClose={() => setIsAddSalonOpen(false)} 
        onAdd={addSalon}
      />
    </div>
  );
}

function NavItem({ item }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Check if any child is active
  const isChildActive = item.children?.some(child => location.pathname === child.to);
  const isActive = location.pathname === item.to || isChildActive;

  // Auto-expand if child is active
  useEffect(() => {
    if (isChildActive) setIsOpen(true);
  }, [isChildActive]);

  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            isActive || isOpen
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <item.icon size={18} className={isActive || isOpen ? "text-blue-600" : "text-gray-400"} />
            <span>{item.label}</span>
          </div>
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {isOpen && (
          <div className="pl-9 space-y-1">
            {item.children.map((child, idx) => (
              <NavLink
                key={idx}
                to={child.to}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "text-blue-600 font-medium"
                      : "text-gray-500 hover:text-gray-900"
                  }`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <item.icon size={18} className={isActive ? "text-white" : "text-gray-400"} />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

function SalonSelector({ salons, activeSalon, onSalonSelect, onAddSalonClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
      >
        <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow-sm">
          <Store size={16} />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs text-gray-500 font-medium">Current Salon</div>
          <div className="text-sm font-semibold text-gray-900 leading-none">
            {activeSalon?.name}
          </div>
        </div>
        <ChevronDown size={16} className="text-gray-400 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Switch Salon
          </div>
          {salons.map((salon) => (
            <button
              key={salon.id}
              onClick={() => {
                onSalonSelect(salon.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                activeSalon?.id === salon.id
                  ? "text-indigo-600 bg-indigo-50 font-medium"
                  : "text-gray-700"
              }`}
            >
              <span>{salon.name}</span>
              {activeSalon?.id === salon.id && <Check size={16} />}
            </button>
          ))}
          <div className="border-t my-1"></div>
          <button 
            onClick={() => {
              setIsOpen(false);
              onAddSalonClick();
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
          >
            <Plus size={16} />
            <span>Add New Salon</span>
          </button>
        </div>
      )}
    </div>
  );
}

function AddSalonModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await onAdd({ name, currency, timezone });
    
    if (result.success) {
      onClose();
      setName("");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add New Salon</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salon Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. My Awesome Salon"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="BAM">BAM (KM)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="America/New_York">New York</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Europe/Sarajevo">Sarajevo</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create Salon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}