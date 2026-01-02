import { useState, useEffect } from "react";
import { X, DollarSign, Image, SortAsc } from "lucide-react";
import { useServices } from "../context/ServiceContext";


export default function ServiceModal({ isOpen, onClose, initialData }) {
  const { addService, updateService } = useServices();

  // Local Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_dollars: "", // UI uses dollars
    duration_min: "30",
    buffer_min: "0",
    is_active: true,
    image_url: "",
    sort_order: "0"
  });

  // Populate form if editing, or reset if creating
  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData({
                ...initialData,
                price_dollars: (initialData.price_cents / 100).toFixed(2), // Convert Cents -> Dollars for display
                duration_min: initialData.duration_min.toString(),
                buffer_min: initialData.buffer_min.toString(),
            });
        } else {
            // Defaults for new service
            setFormData({
                name: "",
                description: "",
                price_dollars: "",
                duration_min: "30",
                buffer_min: "0",
                is_active: true,
                image_url: "",
                sort_order: "0"
            });
        }
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare payload for "Backend"
    const payload = {
        name: formData.name,
        description: formData.description,
        duration_min: parseInt(formData.duration_min) || 0,
        buffer_min: parseInt(formData.buffer_min) || 0,
        is_active: formData.is_active,
        image_url: formData.image_url,
        sort_order: parseInt(formData.sort_order) || 0,
        price_cents: Math.round(parseFloat(formData.price_dollars) * 100), // Convert Dollars -> Cents for saving
    };

    if (initialData) {
      updateService(initialData.id, payload);
    } else {
      addService(payload);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? "Edit Service" : "Add New Service"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
            <form id="serviceForm" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Name <span className="text-red-500">*</span></label>
                <input
                required
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm outline-none transition-all"
                placeholder="e.g. Men's Haircut"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
            </div>

            {/* Price & Duration Row */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ($) <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm outline-none"
                        placeholder="0.00"
                        value={formData.price_dollars}
                        onChange={(e) => setFormData({...formData, price_dollars: e.target.value})}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (min) <span className="text-red-500">*</span></label>
                    <input
                    required
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm outline-none"
                    value={formData.duration_min}
                    onChange={(e) => setFormData({...formData, duration_min: e.target.value})}
                    />
                </div>
            </div>

            {/* Buffer & Sort Order Row */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Buffer Time (min)</label>
                    <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm outline-none"
                    placeholder="0"
                    value={formData.buffer_min}
                    onChange={(e) => setFormData({...formData, buffer_min: e.target.value})}
                    />
                    <p className="text-xs text-gray-400 mt-1">Cleanup time after service</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                    <div className="relative">
                        <SortAsc size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                        type="number"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm outline-none"
                        value={formData.sort_order}
                        onChange={(e) => setFormData({...formData, sort_order: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm outline-none resize-none"
                rows="3"
                placeholder="Detailed description of the service..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>

            {/* Image URL */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                <div className="relative">
                    <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm outline-none"
                    placeholder="https://..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    />
                </div>
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm font-medium text-gray-700">Available for Booking</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={formData.is_active} 
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
            </div>

            </form>
        </div>

        {/* Footer actions */}
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="serviceForm"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 shadow-sm shadow-purple-200 transition-colors"
          >
            {initialData ? "Save Changes" : "Create Service"}
          </button>
        </div>
      </div>
    </div>
  );
}