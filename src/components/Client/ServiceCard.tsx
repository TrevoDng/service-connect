// src/components/Client/ServiceCard.tsx
import React from 'react';
import { Service } from '../../types/service.types';
import { MapPin, Star, User, Clock } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onViewDetails: (service: Service) => void;
  onHire: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onViewDetails, 
  onHire 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-5">
        {/* Category Badge */}
        <div className="flex justify-between items-start mb-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {service.category}
          </span>
          {service.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{service.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {service.description}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{service.location}</span>
          </div>

          {/* Provider */}
          {service.provider_name && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4 flex-shrink-0" />
              <span>{service.provider_name}</span>
            </div>
          )}

          {/* Estimated Duration */}
          {service.estimatedDuration && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{service.estimatedDuration}</span>
            </div>
          )}
        </div>

        {/* Price */}
        {service.price > 0 && (
          <div className="mb-4">
            <span className="text-2xl font-bold text-blue-600">
              R{service.price.toLocaleString()}
            </span>
          </div>
        )}

        {/* Skills */}
        {service.skills && service.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {service.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
            {service.skills.length > 3 && (
              <span className="text-gray-400 text-xs">
                +{service.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(service)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => onHire(service)}
            className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Contact Expert
          </button>
        </div>
      </div>
    </div>
  );
};