import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

interface Coords {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  userLocation: string;
  coords: Coords | null;
  isLocating: boolean;
  hasLocationPermission: boolean;
  isDeviceLocationOn: boolean;
  refreshLocation: () => Promise<void>;
  setUserLocationManually: (address: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState('Location off - Tap to enable');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isDeviceLocationOn, setIsDeviceLocationOn] = useState(false);

  // Check initial permission status (Simulation/Real)
  useEffect(() => {
    // In a real app, you'd check permissions on mount
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "PawNest Location Permission",
          message: "PawNest needs access to your location to find shops nearby.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  const startLocationDetection = async () => {
    setIsLocating(true);
    setUserLocation('Detecting location...');

    try {
      // Step 1: Request permission
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setHasLocationPermission(false);
        setUserLocation('Permission Denied');
        setIsLocating(false);
        Alert.alert("Permission Denied", "Go to settings to enable location for PawNest.");
        return;
      }
      setHasLocationPermission(true);

      // Step 2: Get Position
      // Using Geolocation.getCurrentPosition (requires react-native-geolocation-service)
      Geolocation.getCurrentPosition(
        (position: Geolocation.GeoPosition) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 [LocationContext] Real Coordinates Found:', { latitude, longitude });
          setCoords({ latitude, longitude });
          setIsDeviceLocationOn(true);
          
          // Reverse Geocoding using free Nominatim API
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
            headers: {
              'User-Agent': 'PawNest-App'
            }
          })
          .then(res => res.json())
          .then(data => {
            const addr = data.address;
            // Construct a cleaner address: e.g., "M.G. Road, Kochi, Kerala"
            const street = addr.road || addr.suburb || addr.neighbourhood || '';
            const city = addr.city || addr.town || addr.village || '';
            const state = addr.state || '';
            
            const displayAddress = [street, city, state].filter(Boolean).join(', ') || data.display_name;
            console.log('🏘️ [LocationContext] Address Found:', displayAddress);
            setUserLocation(displayAddress);
            setIsLocating(false);
          })
          .catch(err => {
            console.log('❌ Reverse Geocode Error:', err);
            // Fallback to coordinates if API fails
            setUserLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            setIsLocating(false);
          });
        },
        (error: Geolocation.GeoError) => {
          console.log('Location Error:', error);
          if (error.code === 1) { // PERMISSION_DENIED
             setHasLocationPermission(false);
          } else if (error.code === 2) { // POSITION_UNAVAILABLE (GPS Off) e.g.
             setIsDeviceLocationOn(false);
          }
          setIsLocating(false);
          setUserLocation('Error fetching location');
          Alert.alert("Location Error", error.message || "Could not retrieve location. Check if GPS is on.");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err) {
      console.log('Location Exception:', err);
      setIsLocating(false);
      setUserLocation('Hardware Error');
    }
  };

  const refreshLocation = async () => {
    await startLocationDetection();
  };

  const setUserLocationManually = (address: string) => {
    setUserLocation(address);
    // When set manually, we usually clear coords or set them to a geocoded value
    setCoords(null); 
    setIsDeviceLocationOn(true); // Treat as "active" since we have data
  };

  return (
    <LocationContext.Provider 
      value={{ 
        userLocation, 
        coords, 
        isLocating, 
        hasLocationPermission, 
        isDeviceLocationOn,
        refreshLocation,
        setUserLocationManually
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
