// src/pages/ServiceDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../account/context/AuthContext';
import { serviceService } from '../services/service.service';
import type { Service } from '../types/service.types';
import { MapPin, User, Clock, Star, ArrowLeft } from 'lucide-react';
import styles from './ServiceDetails.module.scss';

export const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          {error || 'Service not found'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.serviceDetails}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className={styles.backButton}
      >
        <ArrowLeft className={styles.backIcon} />
        Back
      </button>

      <div className={styles.serviceCard}>
        {/* Header */}
        <div className={styles.serviceHeader}>
          <div className={styles.serviceHeaderTop}>
            <div>
              <h1 className={styles.serviceTitle}>{service.title}</h1>
              <p className={styles.serviceCategory}>{service.category}</p>
            </div>
            {service.rating && (
              <div className={styles.serviceRating}>
                <Star className={styles.starIcon} />
                <span>{service.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={styles.serviceContent}>
          <div className={styles.serviceContentGrid}>
            {/* Left Column - Details */}
            <div className={styles.serviceDetailsLeft}>
              <div className={styles.detailSection}>
                <h2>Description</h2>
                <p>{service.description}</p>
              </div>

              <div className={styles.detailSection}>
                <h2>Skills & Expertise</h2>
                <div className={styles.skillsList}>
                  {service.skills.map((skill) => (
                    <span key={skill} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.serviceInfoList}>
                <div className={styles.serviceInfoItem}>
                  <MapPin />
                  <span>{service.location}</span>
                </div>
                {service.provider_name && (
                  <div className={styles.serviceInfoItem}>
                    <User />
                    <span>Provider: {service.provider_name}</span>
                  </div>
                )}
                {service.estimatedDuration && (
                  <div className={styles.serviceInfoItem}>
                    <Clock />
                    <span>Estimated duration: {service.estimatedDuration}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Booking */}
            <div className={styles.bookingSection}>
              {service.price > 0 && (
                <div className={styles.bookingPrice}>
                  <p className={styles.priceLabel}>Price</p>
                  <p className={styles.priceValue}>
                    R{service.price.toLocaleString()}
                  </p>
                </div>
              )}

              {isAuthenticated ? (
                <div className={styles.bookingForm}>
                  <div className={styles.bookingField}>
                    <label>Booking Date *</label>
                    <input
                      type="datetime-local"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className={styles.bookingInput}
                    />
                  </div>
                  <div className={styles.bookingField}>
                    <label>Notes (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className={styles.bookingTextarea}
                      placeholder="Any special requirements..."
                    />
                  </div>
                  <button
                    onClick={handleBook}
                    disabled={isBooking || !bookingDate}
                    className={styles.bookingButton}
                  >
                    {isBooking ? 'Requesting...' : 'Request Service'}
                  </button>
                </div>
              ) : (
                <div className={styles.bookingLoginPrompt}>
                  <p>Please login to book this service</p>
                  <button
                    onClick={() => navigate('/login')}
                    className={styles.bookingLoginButton}
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
  );
};

export default ServiceDetails;
