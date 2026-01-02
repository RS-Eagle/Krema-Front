import { useState, useEffect } from "react";
import { X, User, Briefcase, SortAsc, Image as ImageIcon } from "lucide-react";
import { useStaff } from "../context/StaffContext";


export default function StaffModal({ isOpen, onClose, initialData, activeSalonId }) {
  const { addStaff, updateStaff } = useStaff();

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    avatar_url: "",
    sort_order: "1",
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData({
                ...initialData,
                sort_order: initialData.sort_order.toString(),
            });
        } else {
            // Reset
            setFormData({
                name: "",
                title: "",
                avatar_url: "",
                sort_order: "1",
                is_active: true,
            });
        }
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const payload = {
        name: formData.name,
        title: formData.title,
        avatar_url: formData.avatar_url,
        sort_order: parseInt(formData.sort_order) || 0,
        is_active: formData.is_active,
    };

    if (initialData) {
      updateStaff(initialData.id, payload);
    } else {
      addStaff(payload, activeSalonId); // Pass salon ID for creation
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? "Edit Staff Member" : "Add Staff Member"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                required
                type="text"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none"
                placeholder="e.g. Sarah Johnson"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title</label>
            <div className="relative">
                <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                type="text"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none"
                placeholder="e.g. Senior Stylist"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
            </div>
          </div>

          {/* Avatar & Sort Order */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Avatar URL</label>
                <div className="relative">
                    <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none"
                    placeholder="https://..."
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                    />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                <div className="relative">
                    <SortAsc size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                    type="number"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: e.target.value})}
                    />
                </div>
             </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
             <span className="text-sm font-medium text-gray-700">Active Employee</span>
             <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={formData.is_active} 
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
             </label>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors"
            >
                {initialData ? "Save Changes" : "Create Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}