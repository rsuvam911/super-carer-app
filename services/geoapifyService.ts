import axios from 'axios';

interface GeocodingResult {
  place_id: string;
  lon: number;
  lat: number;
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

interface AutocompleteResult {
  place_id: string;
  properties: {
    formatted: string;
    address_line1: string;
    address_line2?: string;
    place_id: string;
    lon: number;
    lat: number;
    result_type: string;
    rank: {
      importance: number;
      popularity: number;
    };
  };
  bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
}

class GeoapifyService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '';
    this.baseUrl = 'https://api.geoapify.com/v1';
    
    if (!this.apiKey) {
      console.warn('NEXT_PUBLIC_GEOAPIFY_API_KEY is not set in environment variables');
    }
  }

  /**
   * Get address autocomplete suggestions
   */
  async autocomplete(text: string): Promise<AutocompleteResult[]> {
    if (!this.apiKey) {
      throw new Error('Geoapify API key is not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/geocode/autocomplete`, {
        params: {
          text: text,
          apiKey: this.apiKey,
          limit: 10,
        },
        headers: {
          'Accept': 'application/json',
        },
      });

      return response.data.features || [];
    } catch (error) {
      console.error('Error fetching autocomplete results:', error);
      throw error;
    }
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocode(address: string): Promise<GeocodingResult[]> {
    if (!this.apiKey) {
      throw new Error('Geoapify API key is not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/geocode/search`, {
        params: {
          text: address,
          apiKey: this.apiKey,
        },
        headers: {
          'Accept': 'application/json',
        },
      });

      return response.data.results || [];
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to get address
   */
  async reverseGeocode(lat: number, lon: number): Promise<GeocodingResult[]> {
    if (!this.apiKey) {
      throw new Error('Geoapify API key is not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/geocode/reverse`, {
        params: {
          lat: lat,
          lon: lon,
          apiKey: this.apiKey,
        },
        headers: {
          'Accept': 'application/json',
        },
      });

      return response.data.results || [];
    } catch (error) {
      console.error('Error reverse geocoding coordinates:', error);
      throw error;
    }
  }
}

export default new GeoapifyService();