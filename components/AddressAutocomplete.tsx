import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import GeoapifyService from '@/services/geoapifyService';

interface Address {
  streetAddress: string;
  city: string | null;
  state: string;
  zipCode: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: Address) => void;
  placeholder?: string;
  className?: string;
}

interface AutocompleteOption {
  place_id: string;
  formatted: string;
  address_line1: string;
  address_line2?: string;
  lat: number;
  lon: number;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Enter an address...',
  className = '',
}: AddressAutocompleteProps) {
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowOptions(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (inputValue.length > 2) {
      setLoading(true);
      debounceTimer.current = setTimeout(async () => {
        try {
          const results = await GeoapifyService.autocomplete(inputValue);
          const formattedResults = results.map((result) => ({
            place_id: result.properties.place_id,
            formatted: result.properties.formatted,
            address_line1: result.properties.address_line1,
            address_line2: result.properties.address_line2,
            lat: result.properties.lat,
            lon: result.properties.lon,
          }));
          setOptions(formattedResults);
          setShowOptions(true);
          setHighlightedIndex(-1);
        } catch (error) {
          console.error('Error fetching autocomplete results:', error);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, 300); // 300ms debounce
    } else {
      setOptions([]);
      setShowOptions(false);
    }
  };

  const handleOptionClick = async (option: AutocompleteOption) => {
    onChange(option.formatted);
    setShowOptions(false);
    setHighlightedIndex(-1);

    // Create a detailed address object from the selected option
    try {
      const detailedResults = await GeoapifyService.reverseGeocode(option.lat, option.lon);
      if (detailedResults.length > 0) {
        const result = detailedResults[0];
        
        const address: Address = {
          streetAddress: `${result.address.road || ''} ${result.address.house_number || ''}`.trim(),
          city: result.address.city || result.address.town || result.address.village || null,
          state: result.address.state || '',
          zipCode: result.address.postcode || null,
          country: result.address.country || '',
          latitude: option.lat,
          longitude: option.lon,
        };
        
        onSelect(address);
      } else {
        // Fallback to basic parsing if reverse geocoding fails
        const addressParts = option.formatted.split(', ');
        const address: Address = {
          streetAddress: option.address_line1,
          city: addressParts[addressParts.length - 3] || null,
          state: addressParts[addressParts.length - 2] || '',
          zipCode: null,
          country: addressParts[addressParts.length - 1] || '',
          latitude: option.lat,
          longitude: option.lon,
        };
        
        onSelect(address);
      }
    } catch (error) {
      console.error('Error getting detailed address:', error);
      // Fallback to basic address if reverse geocoding fails
      const addressParts = option.formatted.split(', ');
      const address: Address = {
        streetAddress: option.address_line1,
        city: addressParts[addressParts.length - 3] || null,
        state: addressParts[addressParts.length - 2] || '',
        zipCode: null,
        country: addressParts[addressParts.length - 1] || '',
        latitude: option.lat,
        longitude: option.lon,
      };
      
      onSelect(address);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < options.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : options.length - 1
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleOptionClick(options[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowOptions(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length > 2 && options.length > 0 && setShowOptions(true)}
          placeholder={placeholder}
          className="pl-10 pr-4 py-2 w-full"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          </div>
        )}
      </div>

      {showOptions && options.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <ul>
            {options.map((option, index) => (
              <li
                key={`${option.place_id}-${index}`}
                onMouseDown={() => handleOptionClick(option)} // Using mouseDown to prevent blur before click
                className={`px-4 py-2 cursor-pointer ${
                  index === highlightedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-gray-700 truncate">{option.formatted}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}