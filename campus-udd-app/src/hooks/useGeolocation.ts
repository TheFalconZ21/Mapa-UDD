'use client';

import { useState, useEffect } from 'react';

// Centro de referencia del campus UDD (San Carlos de Apoquindo)
const LAT_CENTER = -33.3625;
const LNG_CENTER = -70.5040;

// Constantes de escala en metros por grado a esta latitud
const METERS_PER_LAT = 111000;
const METERS_PER_LNG = 93000; // 111000 * cos(-33.36)

// Límites aproximados del Campus UDD para el geoperímetro (Geofence)
const CAMPUS_BOUNDS = {
  minLat: -33.3655,
  maxLat: -33.3595,
  minLng: -70.5075,
  maxLng: -70.5005,
};

// Constantes de la cuadrícula 3D (deben coincidir con Campus3D.tsx)
const UNIT = 2.2;
const GRID_CX = 6;
const GRID_CY = 8;

export interface GeolocationState {
  lat: number;
  lng: number;
  x: number; // Coordenada X local en 3D
  z: number; // Coordenada Z local en 3D
  gx: number; // Coordenada de cuadrícula X
  gy: number; // Coordenada de cuadrícula Y
  isOnCampus: boolean;
  accuracy: number;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Proyectar coordenadas geográficas (lat, lng) a las coordenadas 3D locales
  const projectGpsTo3D = (lat: number, lng: number, accuracy: number): GeolocationState => {
    // Distancias en metros desde el centro de referencia
    const deltaLat = lat - LAT_CENTER;
    const deltaLng = lng - LNG_CENTER;

    const x = deltaLng * METERS_PER_LNG;
    const z = deltaLat * METERS_PER_LAT;

    // Convertir a coordenadas de la cuadrícula (gx, gy)
    const gx = GRID_CX + x / UNIT;
    const gy = GRID_CY + z / UNIT;

    // Verificar geofence
    const isOnCampus =
      lat >= CAMPUS_BOUNDS.minLat &&
      lat <= CAMPUS_BOUNDS.maxLat &&
      lng >= CAMPUS_BOUNDS.minLng &&
      lng <= CAMPUS_BOUNDS.maxLng;

    return {
      lat,
      lng,
      x,
      z,
      gx,
      gy,
      isOnCampus,
      accuracy,
    };
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocalización no soportada en este navegador.');
      setLoading(false);
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      const projected = projectGpsTo3D(latitude, longitude, accuracy);
      setState(projected);
      setError(null);
      setLoading(false);
    };

    const handleError = (error: GeolocationPositionError) => {
      let msg = 'Error desconocido al obtener ubicación.';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          msg = 'Permiso de ubicación denegado por el usuario.';
          break;
        case error.POSITION_UNAVAILABLE:
          msg = 'La información de ubicación no está disponible.';
          break;
        case error.TIMEOUT:
          msg = 'Tiempo de espera agotado al obtener ubicación.';
          break;
      }
      setError(msg);
      setLoading(false);
    };

    // Comenzar monitoreo de la posición del usuario
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { state, error, loading };
}
