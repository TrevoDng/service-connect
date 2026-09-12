// src/components/Client/ServicesFilter.tsx
import React, { useState } from 'react';
import type { ServiceFilterOptions } from '../../types/service.types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './ServicesFilter.module.scss';

interface ServicesFilterProps {
  onFilterChange: (filters: ServiceFilterOptions) => void;
  availableCategories: string[];
}

type SortOption = 'recent' | 'rating' | 'price_low' | 'price_high';

export const ServicesFilter: React.FC<ServicesFilterProps> = ({
  onFilterChange,
  availableCategories,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const applyFilters = () => {
    onFilterChange({
      searchQuery,
      categories: selectedCategories,
      sortBy,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSortBy('recent');
    onFilterChange({
      searchQuery: '',
      categories: [],
      sortBy: 'recent',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'rating', label: 'Highest Rating' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ];

  return (
    <div className={styles.servicesFilter}>
      {/* Search row */}
      <div className={styles.searchRow}>
        <div className={styles.searchInputWrapper}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className={styles.searchInput}
          />
        </div>
        <button onClick={applyFilters} className={styles.searchBtn}>
          Search
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={styles.filterToggleBtn}
        >
          <FontAwesomeIcon icon={faFilter} />
          Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterPanelHeader}>
            <h3>Filter Services</h3>
            <button onClick={clearFilters} className={styles.clearAllBtn}>
              <FontAwesomeIcon icon={faTimes} />
              Clear all
            </button>
          </div>

          {/* Categories */}
          {availableCategories.length > 0 && (
            <div className={styles.filterGroup}>
              <h4>Categories</h4>
              <div className={styles.pillRow}>
                {availableCategories.map((category) => {
                  const isActive = selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sort By */}
          <div className={styles.filterGroup}>
            <h4>Sort By</h4>
            <div className={styles.pillRow}>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`${styles.pill} ${
                    sortBy === option.value ? styles.pillActive : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Apply */}
          <button onClick={applyFilters} className={styles.applyBtn}>
            Apply Filters
          </button>
        </div>
      )}

      {/* Active filter chips */}
      {(searchQuery || selectedCategories.length > 0) && (
        <div className={styles.activeFilters}>
          <span className={styles.activeLabel}>Active filters:</span>

          {searchQuery && (
            <span className={styles.chip}>
              Search: &quot;{searchQuery}&quot;
              <button
                className={styles.chipRemove}
                onClick={() => {
                  setSearchQuery('');
                  onFilterChange({
                    searchQuery: '',
                    categories: selectedCategories,
                    sortBy,
                  });
                }}
                aria-label="Remove search filter"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </span>
          )}

          {selectedCategories.map((category) => (
            <span key={category} className={styles.chip}>
              {category}
              <button
                className={styles.chipRemove}
                onClick={() => {
                  const next = selectedCategories.filter((c) => c !== category);
                  setSelectedCategories(next);
                  onFilterChange({
                    searchQuery,
                    categories: next,
                    sortBy,
                  });
                }}
                aria-label={`Remove ${category} filter`}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesFilter;
