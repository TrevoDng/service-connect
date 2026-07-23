// src/pages/ServiceDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../account/context/AuthContext';
import { serviceService } from '../services/service.service';
import { Service } from '../types/service.types';
import { MapPin, User, Clock, Star, ArrowLeft } from 'lucide-react';

export const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (id) {
      fetchService(id);
    }
  }, [id]);

  const fetchService = async (serviceId: string) => {
    try {
      const data = await serviceService.getServiceById(serviceId);
      setService(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!bookingDate) {
      alert('Please select a booking date');
      return;
    }

    setIsBooking(true);
    try {
      await serviceService.requestService(service!.id, {
        bookingDate,
        notes
      });
      alert('Booking request sent successfully!');
      navigate('/client/bookings');
    } catch (error: any) {
      alert(error.message || 'Failed to book service');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Service not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
              <p className="text-gray-600 mt-1">{service.category}</p>
            </div>
            {service.rating && (
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-semibold">{service.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600">{service.description}</p>
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {service.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{service.location}</span>
                </div>
                {service.provider_name && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Provider: {service.provider_name}</span>
                  </div>
                )}
                {service.estimatedDuration && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Estimated duration: {service.estimatedDuration}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Booking */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6">
                {service.price > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-3xl font-bold text-blue-600">
                      R{service.price.toLocaleString()}
                    </p>
                  </div>
                )}

                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Booking Date *
                      </label>
                      <input
                        type="datetime-local"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Any special requirements..."
                      />
                    </div>
                    <button
                      onClick={handleBook}
                      disabled={isBooking || !bookingDate}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isBooking ? 'Requesting...' : 'Request Service'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Please login to book this service</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                      Login to Book
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};