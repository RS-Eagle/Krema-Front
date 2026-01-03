import { useState } from "react";
import { useAppointment } from "../context/AppointmentContext";
import { useServices } from "../context/ServiceContext";
import { useStaff } from "../context/StaffContext";

export default function Appointment() {
  const { 
    appointments, 
    loading: appointmentsLoading, 
    createAppointment, 
    rescheduleAppointment, 
    updateAppointmentStatus 
  } = useAppointment();
  
  const { allServices } = useServices();
  const { allStaff } = useStaff();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [rescheduleId, setRescheduleId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    service_id: "",
    staff_id: "",
    start_at: "",
    end_at: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    notes: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format dates if necessary, or ensure input type="datetime-local" gives correct format
    // API expects: "2026-01-05T10:00:00"
    
    // Construct payload with only necessary fields
    const formatDateTime = (val) => {
      if (!val) return null;
      // Ensure YYYY-MM-DDTHH:MM:SS
      if (val.length === 16) return `${val}:00`;
      return val;
    };

    const payload = {
      service_id: parseInt(formData.service_id),
      start_at: formatDateTime(formData.start_at),
      end_at: formatDateTime(formData.end_at),
      customer_name: formData.customer_name,
      notes: formData.notes,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // Client-side validation for dates
    if (payload.start_at && payload.end_at && payload.start_at >= payload.end_at) {
      alert("End time must be after start time");
      return;
    }

    // Only add optional fields if they have values
    if (formData.staff_id) {
      payload.staff_id = parseInt(formData.staff_id);
    }

    if (formData.customer_phone) {
      payload.customer_phone = formData.customer_phone;
    }

    if (formData.customer_email) {
      payload.customer_email = formData.customer_email;
    }

    if (rescheduleId) {
      // Reschedule logic
      const result = await rescheduleAppointment(rescheduleId, {
        start_at: payload.start_at,
        end_at: payload.end_at,
        notes: formData.notes,
        timezone: payload.timezone
      });
      if (result.success) {
        setRescheduleId(null);
        resetForm();
      } else {
        alert(result.message);
      }
    } else {
      // Create logic
      const result = await createAppointment(payload);
      if (result.success) {
        setShowCreateForm(false);
        resetForm();
      } else {
        let errorMsg = result.message;
        if (result.errors) {
          // Format validation errors
          const details = Object.values(result.errors).flat().join("\n");
          errorMsg += `\n\n${details}`;
        }
        alert(errorMsg);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      service_id: "",
      staff_id: "",
      start_at: "",
      end_at: "",
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      notes: ""
    });
  };

  const startReschedule = (appointment) => {
    setRescheduleId(appointment.id);
    setFormData({
      service_id: appointment.service_id || "", 
      staff_id: appointment.staff_id || "",
      start_at: appointment.start_at ? appointment.start_at.slice(0, 16) : "", 
      end_at: appointment.end_at ? appointment.end_at.slice(0, 16) : "",
      customer_name: appointment.customer_name || "",
      customer_phone: appointment.customer_phone || "",
      customer_email: appointment.customer_email || "",
      notes: appointment.notes || ""
    });
    setShowCreateForm(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      await updateAppointmentStatus(id, newStatus);
    }
  };

  if (appointmentsLoading && appointments.length === 0) return <div>Loading appointments...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <button 
          onClick={() => { setShowCreateForm(true); setRescheduleId(null); resetForm(); }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          New Appointment
        </button>
      </div>

      {/* Create/Reschedule Modal/Form Area */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {rescheduleId ? "Reschedule Appointment" : "New Appointment"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!rescheduleId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Service</label>
                    <select 
                      name="service_id" 
                      value={formData.service_id} 
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                      required
                    >
                      <option value="">Select Service</option>
                      {allServices.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Staff (Optional)</label>
                    <select 
                      name="staff_id" 
                      value={formData.staff_id} 
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                    >
                      <option value="">Any Staff</option>
                      {allStaff.map(s => (
                        <option key={s.id} value={s.id}>{s.name || `${s.first_name || ''} ${s.last_name || ''}`}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input 
                    type="datetime-local" 
                    name="start_at" 
                    value={formData.start_at} 
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input 
                    type="datetime-local" 
                    name="end_at" 
                    value={formData.end_at} 
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
              </div>

              {!rescheduleId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Customer Name</label>
                    <input 
                      type="text" 
                      name="customer_name" 
                      value={formData.customer_name} 
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input 
                      type="tel" 
                      name="customer_phone" 
                      value={formData.customer_phone} 
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input 
                      type="email" 
                      name="customer_email" 
                      value={formData.customer_email} 
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  rows="3"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={appointmentsLoading}
                >
                  {appointmentsLoading ? "Saving..." : (rescheduleId ? "Reschedule" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No appointments found.
                </td>
              </tr>
            ) : (
              appointments.map((app) => (
                <tr key={app.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(app.start_at).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      to {new Date(app.end_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.service?.name || "Unknown Service"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {app.staff ? (app.staff.name || `${app.staff.first_name || ''} ${app.staff.last_name || ''}`) : "Unassigned"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${app.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        app.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        app.status === 'done' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startReschedule(app)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Reschedule
                      </button>
                      
                      {app.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleStatusChange(app.id, 'cancelled')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                      
                      {app.status === 'confirmed' && (
                        <button 
                          onClick={() => handleStatusChange(app.id, 'done')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
