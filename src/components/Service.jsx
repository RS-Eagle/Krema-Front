import { useState } from "react";


import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Clock, 
  History,
  Archive,
  Image as ImageIcon
} from "lucide-react";
import ServiceModal from "./SeriveModal";
import { useServices } from "../context/ServiceContext";

export default function ServicesPage() {
  const { 
    services, 
    filterStatus, 
    setFilterStatus, 
    setSearchQuery, 
    deleteService,
    activeSalonId 
  } = useServices();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Handlers
  const handleEdit = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* --- Top Header & Controls --- */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        
        {/* Left: Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search services..."
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none"
          />
        </div>

        {/* Right: Filters & Add Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-purple-200"
          >
            <Plus size={18} />
            Add Service
          </button>
        </div>
      </div>

      {/* --- Table Area --- */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50/50 transition-colors group">
                  
                  {/* Name & Image */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center text-gray-400">
                        {service.image_url ? (
                            <img src={service.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon size={20} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{service.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {service.description || "No description"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price (Cents -> Dollars) */}
                  <td className="px-6 py-4 font-bold text-gray-800">
                    ${(service.price_cents / 100).toFixed(2)}
                  </td>

                  {/* Duration & Buffer */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Clock size={14} className="text-gray-400" />
                            <span>{service.duration_min} min</span>
                        </div>
                        {/* Only show buffer if > 0 */}
                        {service.buffer_min > 0 && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 w-fit px-2 py-0.5 rounded-md font-medium">
                                <History size={12} />
                                <span>+{service.buffer_min} clean</span>
                            </div>
                        )}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
                        ${service.is_active 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-red-50 text-red-600 border-red-100"
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${service.is_active ? "bg-emerald-500" : "bg-red-500"}`}></span>
                      {service.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(service)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-xs font-medium"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                            if(window.confirm('Archive this service? (Soft Delete)')) deleteService(service.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deactivate"
                      >
                        <Archive size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Empty State */}
          {services.length === 0 && (
            <div className="p-12 text-center text-gray-500">
                <div className="inline-flex p-4 rounded-full bg-gray-50 mb-4">
                    <Search size={24} className="text-gray-300" />
                </div>
                <p>No services found matching your filters for Salon .</p>
            </div>
          )}
        </div>
        
        {/* Pagination Mock (Visual Only) */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between text-sm text-gray-500">
           <span>Showing 1 to {services.length} of {services.length} entries</span>
           <div className="flex gap-1">
             <button className="px-3 py-1 border rounded hover:bg-gray-50" disabled>Previous</button>
             <button className="px-3 py-1 border rounded bg-purple-600 text-white">1</button>
             <button className="px-3 py-1 border rounded hover:bg-gray-50" disabled>Next</button>
           </div>
        </div>

      </div>

      {/* Modal Injection */}
      <ServiceModal
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingService} 
      />

    </div>
  );
}