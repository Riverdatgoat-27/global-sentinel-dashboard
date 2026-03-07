import { useState, useEffect, useCallback } from 'react';
import type { GlobeEvent, EarthquakeFeature } from '@/types/intelligence';

export function useEarthquakeData(refreshInterval = 300000) {
  const [earthquakes, setEarthquakes] = useState<GlobeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEarthquakes = useCallback(async () => {
    try {
      const response = await fetch(
        'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson'
      );
      if (!response.ok) throw new Error('USGS API error');
      const data = await response.json();

      const events: GlobeEvent[] = data.features.map((f: EarthquakeFeature) => {
        const mag = f.properties.mag;
        let severity: GlobeEvent['severity'] = 'low';
        if (mag >= 7) severity = 'critical';
        else if (mag >= 5.5) severity = 'high';
        else if (mag >= 4) severity = 'medium';

        return {
          id: `eq-${f.id}`,
          type: 'earthquake' as const,
          title: f.properties.title,
          description: `Magnitude ${mag} earthquake - ${f.properties.place}`,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          severity,
          timestamp: new Date(f.properties.time).toISOString(),
          source: 'USGS',
          metadata: {
            magnitude: mag,
            depth: f.geometry.coordinates[2],
            url: f.properties.url,
            alert: f.properties.alert,
          },
        };
      });

      setEarthquakes(events);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch earthquakes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarthquakes();
    const interval = setInterval(fetchEarthquakes, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchEarthquakes, refreshInterval]);

  return { earthquakes, loading, error, refetch: fetchEarthquakes };
}
