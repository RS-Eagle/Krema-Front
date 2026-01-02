import { useState } from "react";



import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  User, 
  Briefcase 
} from "lucide-react";
import { useStaff } from "../context/StaffContext";
import StaffModal from "./Staffmodal";
import { useServices } from "../context/ServiceContext";

export default function StaffPage() {
  const { 
    allStaff, 
    filterStatus, 
    setFilterStatus, 
    searchQuery, 
    setSearchQuery, 
    deleteStaff 
  } = useStaff();

  // Get the Active Salon ID from your existing Service Context
  const { activeSalonId } = useServices();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // --- Filtering Logic ---
  const filteredStaff = allStaff.filter((staff) => {
    const matchesSalon = staff.salonId === activeSalonId;
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          staff.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === "active") matchesStatus = staff.is_active === true;
    if (filterStatus === "inactive") matchesStatus = staff.is_active === false;

    return matchesSalon && matchesSearch && matchesStatus;
  });

  // --- Handlers ---
  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search staff by name or title..."
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-200"
          >
            <Plus size={18} />
            Add Staff
          </button>
        </div>
      </div>

      {/* Staff List Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Sort Order</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors group">
                  
                  {/* Avatar & Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                        {staff.avatar_url ? (
                            <img src={staff.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span>{staff.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="font-bold text-gray-900">{staff.name}</div>
                    </div>
                  </td>

                  {/* Job Title */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        {staff.title ? (
                            <>
                             <Briefcase size={14} className="text-gray-400" />
                             <span>{staff.title}</span>
                            </>
                        ) : (
                            <span className="text-gray-400 italic">No title</span>
                        )}
                    </div>
                  </td>

                  {/* Sort Order */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    #{staff.sort_order}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
                        ${staff.is_active 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-red-50 text-red-600 border-red-100"
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${staff.is_active ? "bg-emerald-500" : "bg-red-500"}`}></span>
                      {staff.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(staff)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                            if(window.confirm('Deactivate this staff member?')) deleteStaff(staff.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deactivate"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStaff.length === 0 && (
            <div className="p-12 text-center text-gray-500">
                <div className="inline-flex p-4 rounded-full bg-gray-50 mb-4">
                    <User size={24} className="text-gray-300" />
                </div>
                <p>No staff members found for Salon #{activeSalonId}.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <StaffModal
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingStaff} 
        activeSalonId={activeSalonId}
      />
    </div>
  );
}