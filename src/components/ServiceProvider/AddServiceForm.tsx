// src/components/ServiceProvider/AddServiceForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../account/context/AuthContext';
import { serviceService } from '../../services/service.service';
import { ServiceFormData } from '../../types/service.types';

// ✅ Add the interface with onServiceAdded prop
interface AddServiceFormProps {
  onServiceAdded?: () => void;  // Made optional with '?'
}

const categories = [
  'Gardening',
  'Tree Cutting',
  'House Keeping',
  'Plumbing',
  'Electrical',
  'Painting',
  'Carpentry',
  'Roofing',
  'HVAC',
  'Building',
  'Renovation',
  'Cleaning',
  'Landscaping',
  'Other'
];

export const AddServiceForm: React.FC<AddServiceFormProps> = ({ onServiceAdded }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    category: '',
    price: '',
    location: '',
    availability: '',
    estimatedDuration: '',
    skills: []
  });

  const [skillInput, setSkillInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setErrorMessage('Please login first');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await serviceService.createService(formData);
      setSuccessMessage('Service listed successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        price: '',
        location: '',
        availability: '',
        estimatedDuration: '',
        skills: []
      });
      
      // ✅ Call the callback if it exists
      if (onServiceAdded) {
        onServiceAdded();
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">List Your Service</h2>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Service Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Professional Gardening Services"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your service in detail..."
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-1">Price (ZAR)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-1">Service Area *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Cape Town, Citywide, Regional"
          />
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium mb-1">Availability</label>
          <input
            type="text"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Mon-Fri 8am-5pm, Weekends available"
          />
        </div>

        {/* Estimated Duration */}
        <div>
          <label className="block text-sm font-medium mb-1">Estimated Duration</label>
          <input
            type="text"
            name="estimatedDuration"
            value={formData.estimatedDuration}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 2-4 hours, 1-2 days"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium mb-1">Skills & Expertise</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a skill (e.g., Lawn Mowing)"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Adding Service...' : 'Add Service'}
        </button>
      </form>
    </div>
  );
};