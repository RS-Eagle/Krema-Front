import { useState, useEffect } from "react";

import { 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Scissors
} from "lucide-react";
import { useServices } from "../context/ServiceContext";
import { useStaff } from "../context/StaffContext";
import { useAppointment } from "../context/AppointmentContext";
import { useUser } from "../context/UserContext";

export default function DashboardPage() {
  const { loading: userLoading, activeSalonId } = useUser();
  const { services, loading: servicesLoading } = useServices();
  const { allStaff, loading: staffLoading } = useStaff();
  const { appointments, loading: appointmentsLoading, fetchAppointments } = useAppointment();
  
  const loading = userLoading || servicesLoading || staffLoading || appointmentsLoading;

  // Derived Stats
  const activeStaffCount = allStaff ? allStaff.filter(s => s.is_active).length : 0;
  const totalServicesCount = services ? services.length : 0;
  
  return (
    <div className="space-y-6">
      
      {/* 1. Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* 2. Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value="$0.00" 
          icon={DollarSign} 
          trend={0}
          color="blue"
          loading={loading}
        />
        <StatCard 
          title="Appointments" 
          value="0" 
          icon={Calendar} 
          trend={0} 
          subtext="Today"
          color="purple"
          loading={loading}
        />
        <StatCard 
          title="Active Staff" 
          value={activeStaffCount} 
          icon={Users} 
          subtext="Clocked In"
          color="emerald"
          loading={loading}
        />
        <StatCard 
          title="Total Services" 
          value={totalServicesCount} 
          icon={Scissors} 
          trend={0} 
          color="orange"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. Today's Schedule (Takes up 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
           <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Today's Appointments</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Calendar</button>
           </div>
           <div className="p-0 overflow-x-auto">
              <AppointmentsTable appointments={appointments} loading={loading} />
           </div>
        </div>

        {/* 4. Top Services (Takes up 1 column) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
           <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Services List</h2>
           </div>
           <div className="p-5 flex-1">
              <TopServicesList services={services} loading={loading} />
           </div>
        </div>

      </div>
    </div>
  );
}

// --- Sub Components ---

function StatCard({ title, value, icon: Icon, trend, subtext, color, loading }) {
  // Color mapping for dynamic styles
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  if (loading) return <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        
        <div className="flex items-center gap-2 mt-2">
           {trend !== undefined && (
             <span className={`text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5
                ${trend >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
             `}>
               {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
               {Math.abs(trend)}%
             </span>
           )}
           {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
        </div>
      </div>
      <div className={`p-3 rounded-lg ${colors[color] || colors.blue}`}>
        <Icon size={22} />
      </div>
    </div>
  );
}

function AppointmentsTable({ appointments = [], loading }) {
  const { allStaff } = useStaff();

  // Helper to find staff name
  const getStaffName = (staffId) => {
    if (!staffId) return "Unassigned";
    // Check if staff object is passed directly (unlikely based on user input, but good for safety)
    if (typeof staffId === 'object') {
       return staffId.name || `${staffId.first_name || ''} ${staffId.last_name || ''}`;
    }
    // Find in context
    const staff = allStaff.find(s => s.id === staffId);
    return staff ? (staff.name || `${staff.first_name || ''} ${staff.last_name || ''}`.trim()) : "Unknown Staff";
  };

  if (loading) {
    return (
        <div className="p-5 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded animate-pulse" />)}
        </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <p>No appointments scheduled for today.</p>
      </div>
    );
  }

  return (
    <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
            <tr>
                <th className="px-5 py-3 font-medium">Time</th>
                
                <th className="px-5 py-3 font-medium">Staff</th>
                <th className="px-5 py-3 font-medium text-right">Status</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
            {appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-gray-600 font-medium whitespace-nowrap flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        {new Date(appt.start_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    
                    <td className="px-5 py-4 text-gray-500">{getStaffName(appt.staff_id || appt.staff)}</td>
                    <td className="px-5 py-4 text-right">
                        <StatusBadge status={appt.status} />
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
  );
}

function StatusBadge({ status }) {
    const styles = {
        confirmed: "bg-blue-50 text-blue-700",
        completed: "bg-emerald-50 text-emerald-700",
        done: "bg-emerald-50 text-emerald-700",
        pending: "bg-orange-50 text-orange-700",
        cancelled: "bg-red-50 text-red-700"
    };

    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || "bg-gray-100 text-gray-800"}`}>
            {status}
        </span>
    );
}

function TopServicesList({ services, loading }) {
    if (loading) return <div className="space-y-4 animate-pulse"><div className="h-4 w-3/4 bg-gray-100 rounded"/></div>;

    // Just show the first 5 services since we don't have booking counts
    const displayServices = services ? services.slice(0, 5) : [];

    if (displayServices.length === 0) {
      return <div className="text-sm text-gray-500 text-center py-4">No services available</div>;
    }

    return (
        <div className="space-y-6">
            {displayServices.map((item, idx) => (
                <div key={idx}>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          {item.duration_min} min • ${(item.price_cents / 100).toFixed(2)}
                        </span>
                    </div>
                    {/* Progress Bar - Just for visual, set to 100% or random since we have no data */}
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `100%` }}
                        ></div>
                    </div>
                </div>
            ))}

            <button className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-all">
                View All Services
            </button>
        </div>
    );
}