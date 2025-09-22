import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useListings } from '../contexts/ListingsContext';
import { useNavigate } from 'react-router-dom';
import { listingsService, imageUploadService } from '../services/firebase';
import { loadGoogleMapsScript } from '../utils/googleMaps';
import LiquidGlassNav from './LiquidGlassNav';
import SuccessModal from './SuccessModal';
import { Camera, MapPin, DollarSign, FileText, X, Crosshair, Upload } from 'lucide-react';

export default function ListItemPage() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { addListing } = useListings();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    period: 'day',
    location: '',
    condition: 'excellent',
    availability: '',
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);

  const categories = [
    'Power Tools',
    'Garden Tools',
    'Electronics',
    'Kitchen Appliances',
    'Sports Equipment',
    'Home & DIY',
    'Photography',
    'Automotive',
    'Musical Instruments',
    'Health & Fitness',
    'Baby & Kids',
    'Books & Education',
    'Art & Craft',
    'Outdoor & Camping',
    'Party & Events',
    'Office Equipment',
    'Beauty & Personal Care',
    'Gaming',
    'Other'
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent - Like new' },
    { value: 'good', label: 'Good - Minor wear' },
    { value: 'fair', label: 'Fair - Some wear but functional' },
    { value: 'poor', label: 'Poor - Heavy wear but working' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle location input with suggestions
    if (name === 'location') {
      handleLocationSearch(value);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images
    const newFiles = files.slice(0, 5 - uploadedImages.length);
    setUploadedImages(prev => [...prev, ...newFiles]);

    // Create preview URLs
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  // Remove image
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]); // Clean up object URL
      return prev.filter((_, i) => i !== index);
    });
  };

  // Singapore locations for suggestions
  const singaporeLocations = [
    'Orchard Road, Singapore',
    'Marina Bay, Singapore',
    'Sentosa Island, Singapore',
    'Chinatown, Singapore',
    'Little India, Singapore',
    'Kampong Glam, Singapore',
    'Clarke Quay, Singapore',
    'Boat Quay, Singapore',
    'Jurong East, Singapore',
    'Tampines, Singapore',
    'Woodlands, Singapore',
    'Ang Mo Kio, Singapore',
    'Bishan, Singapore',
    'Bedok, Singapore',
    'Clementi, Singapore',
    'Hougang, Singapore',
    'Pasir Ris, Singapore',
    'Punggol, Singapore',
    'Serangoon, Singapore',
    'Toa Payoh, Singapore',
    'Yishun, Singapore',
    'Bukit Timah, Singapore',
    'Novena, Singapore',
    'Kallang, Singapore',
    'Queenstown, Singapore',
    'Bukit Batok, Singapore',
    'Choa Chu Kang, Singapore',
    'Sengkang, Singapore'
  ];

  // Handle location search and suggestions
  const handleLocationSearch = async (searchTerm: string) => {
    if (searchTerm.length > 2) {
      try {
        // Load Google Maps script if not already loaded
        await loadGoogleMapsScript();

        // Use Google Places API
        if (window.google && window.google.maps && window.google.maps.places) {
          const service = new window.google.maps.places.AutocompleteService();
          service.getPlacePredictions(
            {
              input: searchTerm,
              componentRestrictions: { country: 'sg' }, // Restrict to Singapore
              types: ['geocode'] // Only geographical locations
            },
            (predictions: any, status: any) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                const suggestions = predictions.slice(0, 5).map((p: any) => p.description);
                setLocationSuggestions(suggestions);
                setShowLocationSuggestions(true);
              } else {
                // Fallback to local suggestions
                const filtered = singaporeLocations.filter(location =>
                  location.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setLocationSuggestions(filtered.slice(0, 5));
                setShowLocationSuggestions(true);
              }
            }
          );
        }
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        // Fallback to local suggestions
        const filtered = singaporeLocations.filter(location =>
          location.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setLocationSuggestions(filtered.slice(0, 5));
        setShowLocationSuggestions(true);
      }
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  // Get coordinates from location string (simplified geocoding)
  const getCoordinatesFromLocation = (location: string): {lat: number, lng: number} => {
    const locationCoords: { [key: string]: {lat: number, lng: number} } = {
      'orchard': { lat: 1.3048, lng: 103.8318 },
      'marina bay': { lat: 1.2816, lng: 103.8636 },
      'sentosa': { lat: 1.2494, lng: 103.8303 },
      'chinatown': { lat: 1.2820, lng: 103.8454 },
      'little india': { lat: 1.3067, lng: 103.8518 },
      'kampong glam': { lat: 1.3006, lng: 103.8583 },
      'clarke quay': { lat: 1.2883, lng: 103.8463 },
      'boat quay': { lat: 1.2872, lng: 103.8507 },
      'jurong east': { lat: 1.3329, lng: 103.7436 },
      'tampines': { lat: 1.3526, lng: 103.9449 },
      'woodlands': { lat: 1.4382, lng: 103.7890 },
      'ang mo kio': { lat: 1.3691, lng: 103.8454 },
      'bishan': { lat: 1.3519, lng: 103.8486 },
      'bedok': { lat: 1.3236, lng: 103.9273 },
      'clementi': { lat: 1.3162, lng: 103.7649 },
      'hougang': { lat: 1.3712, lng: 103.8862 },
      'pasir ris': { lat: 1.3721, lng: 103.9476 },
      'punggol': { lat: 1.4043, lng: 103.9021 },
      'serangoon': { lat: 1.3554, lng: 103.8671 },
      'toa payoh': { lat: 1.3340, lng: 103.8560 },
      'yishun': { lat: 1.4285, lng: 103.8329 },
      'bukit timah': { lat: 1.3294, lng: 103.8080 },
      'novena': { lat: 1.3209, lng: 103.8439 },
      'kallang': { lat: 1.3115, lng: 103.8615 },
      'queenstown': { lat: 1.2947, lng: 103.8057 },
      'bukit batok': { lat: 1.3530, lng: 103.7618 },
      'choa chu kang': { lat: 1.3840, lng: 103.7470 },
      'sengkang': { lat: 1.3868, lng: 103.8914 }
    };

    const searchKey = location.toLowerCase().split(',')[0];
    return locationCoords[searchKey] || { lat: 1.3521, lng: 103.8198 }; // Default to Singapore center
  };

  // Handle location selection
  const handleLocationSelect = async (location: string) => {
    setFormData(prev => ({ ...prev, location }));
    setShowLocationSuggestions(false);

    try {
      // Load Google Maps script if not already loaded
      await loadGoogleMapsScript();

      // Use Google Maps Geocoding API
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: location }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const coords = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            };
            setSelectedCoordinates(coords);
            setTimeout(() => {
              updateMiniMap(coords);
            }, 100);
          } else {
            // Fallback to predefined coordinates
            const coords = getCoordinatesFromLocation(location);
            setSelectedCoordinates(coords);
            setTimeout(() => {
              updateMiniMap(coords);
            }, 100);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load Google Maps:', error);
      // Fallback to predefined coordinates
      const coords = getCoordinatesFromLocation(location);
      setSelectedCoordinates(coords);
      setTimeout(() => {
        updateMiniMap(coords);
      }, 100);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setSelectedCoordinates(coords);

          try {
            // Load Google Maps script if not already loaded
            await loadGoogleMapsScript();

            // Use reverse geocoding with Google Maps API
            if (window.google && window.google.maps) {
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: coords }, (results: any, status: any) => {
                if (status === 'OK' && results && results[0]) {
                  const address = results[0].formatted_address;
                  setFormData(prev => ({ ...prev, location: address }));
                } else {
                  // Fallback to a generic current location
                  setFormData(prev => ({ ...prev, location: 'Current Location, Singapore' }));
                }
              });
            }
          } catch (error) {
            console.error('Failed to load Google Maps for reverse geocoding:', error);
            // Fallback when Google Maps is not available
            setFormData(prev => ({ ...prev, location: 'Current Location, Singapore' }));
          }

          // Update mini map after a short delay to ensure the element is rendered
          setTimeout(() => {
            updateMiniMap(coords);
          }, 100);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please enter it manually.');
          setIsLoadingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setIsLoadingLocation(false);
    }
  };

  // Update mini map
  const updateMiniMap = async (coords: {lat: number, lng: number}) => {
    try {
      // Load Google Maps script if not already loaded
      await loadGoogleMapsScript();

      if (window.google && miniMapRef.current) {
        const map = new window.google.maps.Map(miniMapRef.current, {
          zoom: 15,
          center: coords,
          disableDefaultUI: true,
          styles: theme === 'dark' ? [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          ] : []
        });

        new window.google.maps.Marker({
          position: coords,
          map: map,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="32" height="48" viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 32 16 32s16-23.163 16-32C32 7.163 24.837 0 16 0z" fill="#3B82F6"/>
                <circle cx="16" cy="16" r="8" fill="white"/>
                <circle cx="16" cy="16" r="4" fill="#3B82F6"/>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(32, 48),
            anchor: new window.google.maps.Point(16, 48),
          }
        });
      }
    } catch (error) {
      console.error('Failed to load Google Maps for mini map:', error);
      // If Google Maps fails to load, the mini map won't display (graceful degradation)
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user's location for listing
  const getUserLocation = (): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => {
            // Fallback to Singapore center if location access denied
            resolve({ lat: 1.3521, lng: 103.8198 });
          }
        );
      } else {
        // Fallback to Singapore center if geolocation not supported
        resolve({ lat: 1.3521, lng: 103.8198 });
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert('You must be logged in to create a listing');
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];

      // Upload images if any
      if (uploadedImages.length > 0) {
        setIsUploadingImages(true);
        const timestamp = Date.now();
        const imagePath = `listings/${currentUser.uid}/${timestamp}`;
        imageUrls = await imageUploadService.uploadImages(uploadedImages, imagePath);
        setIsUploadingImages(false);
      }

      // Use selected coordinates from location picker, or get user's coordinates as fallback
      const coordinates = selectedCoordinates || await getUserLocation();

      // Create the listing in Firebase
      const listingData = {
        name: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        period: formData.period,
        location: formData.location,
        condition: formData.condition,
        availability: formData.availability || 'Available',
        imageUrls: imageUrls,
        owner: currentUser.displayName || 'Anonymous',
        ownerContact: currentUser.email || '',
        coordinates: coordinates
      };

      // @ts-ignore: listingId may be used for logging or future functionality
      const listingId = await listingsService.createListing(listingData);

      // Also add to local context for immediate UI update
      const localListingData = {
        ...listingData,
        id: Date.now(), // Temporary ID for local context
        image: imageUrls.length > 0 ? '' : getCategoryEmoji(formData.category), // Use emoji only if no images
        rating: 0,
        reviews: 0,
        createdAt: new Date().toISOString()
      };

      addListing(localListingData);

      // Show success modal
      setSuccessMessage({
        title: 'Listing Published Successfully!',
        message: `Your "${formData.title}" listing is now live and visible to other users. You can manage it from the "My Rentals" page.`
      });
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        price: '',
        period: 'day',
        location: '',
        condition: 'excellent',
        availability: '',
      });

      // Reset location state
      setSelectedCoordinates(null);
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);

      // Reset image state
      setUploadedImages([]);
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setImagePreviewUrls([]);

    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Error creating listing. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsUploadingImages(false);
    }
  };

  // Helper function to get category emoji
  const getCategoryEmoji = (category: string): string => {
    const categoryEmojis: { [key: string]: string } = {
      'Power Tools': '🔨',
      'Garden Tools': '🌱',
      'Electronics': '📱',
      'Kitchen Appliances': '🍳',
      'Sports Equipment': '🎾',
      'Home & DIY': '🎨',
      'Photography': '📷',
      'Automotive': '🚗',
      'Musical Instruments': '🎵',
      'Health & Fitness': '💪',
      'Baby & Kids': '🧸',
      'Books & Education': '📚',
      'Art & Craft': '🎭',
      'Outdoor & Camping': '🏕️',
      'Party & Events': '🎉',
      'Office Equipment': '💼',
      'Beauty & Personal Care': '💄',
      'Gaming': '🎮',
      'Other': '🔧'
    };
    return categoryEmojis[category] || '🔧';
  };

  const handleSaveDraft = () => {
    // Save form data to localStorage as draft
    localStorage.setItem('listingDraft', JSON.stringify(formData));
    alert('Draft saved! You can continue editing later.');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      <LiquidGlassNav />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">List Your Tool</h1>
          <p className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Share your tools and start earning money
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className={`rounded-2xl p-6 border-0 shadow-sm ${
            theme === 'dark'
              ? 'bg-gray-800/60'
              : 'bg-white/80 backdrop-blur-sm'
          }`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Photos ({uploadedImages.length}/5)
            </h3>

            {/* Image Previews */}
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {uploadedImages.length < 5 && (
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-gray-600 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`} onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Add photos of your tool
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Drag and drop or click to upload (max 5 photos)
                </p>
                <button type="button" className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition-colors">
                  Choose Files
                </button>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Basic Information */}
          <div className={`rounded-2xl p-6 border-0 shadow-sm ${
            theme === 'dark'
              ? 'bg-gray-800/60'
              : 'bg-white/80 backdrop-blur-sm'
          }`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Basic Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tool Name</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Cordless Drill, Lawn Mower"
                  className={`w-full px-4 py-3 rounded-xl border-0 shadow-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 text-white placeholder-gray-400'
                      : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your tool, its condition, and any special features..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border-0 shadow-sm resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 text-white placeholder-gray-400'
                      : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-0 shadow-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700/50 text-white'
                        : 'bg-gray-50 text-gray-900'
                    }`}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-0 shadow-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700/50 text-white'
                        : 'bg-gray-50 text-gray-900'
                    }`}
                  >
                    {conditions.map((condition) => (
                      <option key={condition.value} value={condition.value}>{condition.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Location */}
          <div className={`rounded-2xl p-6 border-0 shadow-sm ${
            theme === 'dark'
              ? 'bg-gray-800/60'
              : 'bg-white/80 backdrop-blur-sm'
          }`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Pricing & Location
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Rental Price</label>
                  <div className="flex">
                    <span className={`px-4 py-3 rounded-l-xl border-0 ${
                      theme === 'dark'
                        ? 'bg-gray-700/50 text-gray-300'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      $
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="25"
                      className={`flex-1 px-4 py-3 rounded-r-xl border-0 shadow-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700/50 text-white placeholder-gray-400'
                          : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Per</label>
                  <select
                    name="period"
                    value={formData.period}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-0 shadow-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700/50 text-white'
                        : 'bg-gray-50 text-gray-900'
                    }`}
                  >
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="relative" ref={locationInputRef}>
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Orchard, Singapore"
                    className={`w-full pl-10 pr-24 py-3 rounded-xl border-0 shadow-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700/50 text-white placeholder-gray-400'
                        : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                    }`}
                    required
                  />

                  {/* Current Location Button */}
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-600/50 hover:bg-gray-600/70 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                    } ${isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Use current location"
                  >
                    {isLoadingLocation ? (
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                    ) : (
                      <Crosshair className="w-4 h-4" />
                    )}
                  </button>

                  {/* Location Suggestions Dropdown */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border shadow-lg z-50 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    }`}>
                      {locationSuggestions.map((location, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleLocationSelect(location)}
                          className={`w-full text-left px-4 py-3 hover:bg-opacity-75 transition-colors border-b last:border-b-0 ${
                            theme === 'dark'
                              ? 'hover:bg-gray-700 border-gray-700 text-gray-200'
                              : 'hover:bg-gray-50 border-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                            <span>{location}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mini Map */}
                {selectedCoordinates && (
                  <div className="mt-3">
                    <div
                      ref={miniMapRef}
                      className={`w-full h-32 rounded-xl border-2 ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Availability</label>
                <input
                  type="text"
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  placeholder="e.g., Weekends, Weekdays after 6pm"
                  className={`w-full px-4 py-3 rounded-xl border-0 shadow-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 text-white placeholder-gray-400'
                      : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700/50 hover:bg-gray-700/70 text-gray-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isUploadingImages ? (
                <>
                  <Upload className="w-4 h-4 animate-pulse" />
                  <span>Uploading Images...</span>
                </>
              ) : isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Listing</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successMessage.title}
        message={successMessage.message}
        actionButton={{
          text: "View My Listings",
          onClick: () => {
            setShowSuccessModal(false);
            navigate('/my-rentals');
          }
        }}
      />
    </div>
  );
}