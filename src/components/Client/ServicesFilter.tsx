// src/components/Client/ServicesFilter.tsx
import React, { useState } from 'react';
import { ServiceFilterOptions } from '../../types/service.types';
import { Search, Filter, X } from 'lucide-react';

interface ServicesFilterProps {
  onFilterChange: (filters: ServiceFilterOptions) => void;
  availableCategories: string[];
}

export const ServicesFilter: React.FC<ServicesFilterProps> = ({ 
  onFilterChange, 
  availableCategories 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'price_low' | 'price_high'>('recent');

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const applyFilters = () => {
    onFilterChange({
      searchQuery,
      categories: selectedCategories,
      sortBy
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSortBy('recent');
    onFilterChange({
      searchQuery: '',
      categories: [],
      sortBy: 'recent'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Filter Services</h3>
            <button 
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear all
            </button>
          </div>

          {/* Categories */}
          {availableCategories.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-3 py-1 text-sm rounded-full border ${
                      selectedCategories.includes(category)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort By */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Sort By</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'recent', label: 'Most Recent' },
                { value: 'rating', label: 'Highest Rating' },
                { value: 'price_low', label: 'Price: Low to High' },
                { value: 'price_high', label: 'Price: High to Low' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={`px-3 py-1 text-sm rounded-full border ${
                    sortBy === option.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={applyFilters}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Active Filters */}
      {(searchQuery || selectedCategories.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>
          {searchQuery && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
              Search: "{searchQuery}"
              <button 
                onClick={() => {
                  setSearchQuery('');
                  applyFilters();
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {selectedCategories.map((category) => (
            <span key={category} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
              {category}
              <button 
                onClick={() => {
                  handleCategoryToggle(category);
                  setTimeout(applyFilters, 100);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};