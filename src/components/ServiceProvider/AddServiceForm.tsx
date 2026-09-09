// src/components/ServiceProvider/AddServiceForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../account/context/AuthContext';
import { serviceService } from '../../services/service.service';
import type { ServiceFormData } from '../../types/service.types';
import styles from './AddServiceForm.module.scss';

interface AddServiceFormProps {
  onServiceAdded?: () => void;
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
    <div className={styles.addServiceForm}>
      <h2>List Your Service</h2>
      
      {successMessage && (
        <div className={styles.alertSuccess}>
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className={styles.alertError}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Service Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Professional Gardening Services"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className={styles.formSelect}
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe your service in detail..."
            className={styles.formTextarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Price (ZAR)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., 500"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Service Area *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="e.g., Cape Town, Citywide, Regional"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Availability</label>
          <input
            type="text"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            placeholder="e.g., Mon-Fri 8am-5pm, Weekends available"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Estimated Duration</label>
          <input
            type="text"
            name="estimatedDuration"
            value={formData.estimatedDuration}
            onChange={handleChange}
            placeholder="e.g., 2-4 hours, 1-2 days"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Skills & Expertise</label>
          <div className={styles.skillsContainer}>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Add a skill (e.g., Lawn Mowing)"
              className={styles.formInput}
            />
            <button type="button" onClick={addSkill} className={styles.addSkillBtn}>
              Add
            </button>
          </div>
          <div className={styles.skillsTags}>
            {formData.skills.map((skill) => (
              <span key={skill} className={styles.skillTag}>
                {skill}
                <button type="button" onClick={() => removeSkill(skill)}>
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Adding Service...' : 'Add Service'}
        </button>
      </form>
    </div>
  );
};

export default AddServiceForm;
