import { useState, useEffect, useCallback } from 'react';
import type { GlobeEvent } from '@/types/intelligence';

interface GDELTArticle {
  url: string;
  title: string;
  seendate: string;
  socialimage: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

// Map country codes to approximate lat/lng
const countryCoords: Record<string, { lat: number; lng: number }> = {
  US: { lat: 38.9, lng: -77.0 }, UK: { lat: 51.5, lng: -0.1 }, FR: { lat: 48.9, lng: 2.3 },
  DE: { lat: 52.5, lng: 13.4 }, RU: { lat: 55.8, lng: 37.6 }, CN: { lat: 39.9, lng: 116.4 },
  UA: { lat: 50.4, lng: 30.5 }, IL: { lat: 31.8, lng: 35.2 }, IR: { lat: 35.7, lng: 51.4 },
  SY: { lat: 33.5, lng: 36.3 }, IQ: { lat: 33.3, lng: 44.4 }, IN: { lat: 28.6, lng: 77.2 },
  JP: { lat: 35.7, lng: 139.7 }, KR: { lat: 37.6, lng: 127.0 }, KP: { lat: 39.0, lng: 125.8 },
  TW: { lat: 25.0, lng: 121.5 }, PH: { lat: 14.6, lng: 121.0 }, AU: { lat: -33.9, lng: 151.2 },
  BR: { lat: -15.8, lng: -47.9 }, MX: { lat: 19.4, lng: -99.1 }, EG: { lat: 30.0, lng: 31.2 },
  SA: { lat: 24.7, lng: 46.7 }, TR: { lat: 41.0, lng: 28.9 }, PK: { lat: 33.7, lng: 73.0 },
  NG: { lat: 9.1, lng: 7.5 }, ZA: { lat: -26.2, lng: 28.0 }, PL: { lat: 52.2, lng: 21.0 },
};

function classifyEvent(title: string): { type: GlobeEvent['type']; severity: GlobeEvent['severity'] } {
  const t = title.toLowerCase();
  if (t.includes('missile') || t.includes('strike') || t.includes('attack') || t.includes('bomb')) {
    return { type: 'military', severity: 'critical' };
  }
  if (t.includes('military') || t.includes('army') || t.includes('troops') || t.includes('war') || t.includes('drone')) {
    return { type: 'military', severity: 'high' };
  }
  if (t.includes('protest') || t.includes('riot') || t.includes('demonstrat')) {
    return { type: 'protest', severity: 'medium' };
  }
  if (t.includes('cyber') || t.includes('hack') || t.includes('ransomware') || t.includes('breach')) {
    return { type: 'cyber', severity: 'high' };
  }
  if (t.includes('earthquake') || t.includes('tsunami') || t.includes('hurricane') || t.includes('flood')) {
    return { type: 'earthquake', severity: 'high' };
  }
  if (t.includes('sanction') || t.includes('diplomacy') || t.includes('treaty') || t.includes('summit')) {
    return { type: 'financial', severity: 'medium' };
  }
  return { type: 'military', severity: 'low' };
}

export function useGDELTData(refreshInterval = 120000) {
  const [events, setEvents] = useState<GlobeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      // GDELT DOC 2.0 API - free, no key required
      const queries = [
        'military OR missile OR airstrike OR conflict',
        'cyber attack OR ransomware OR hacking',
        'protest OR riot OR unrest',
      ];
      
      const allArticles: GDELTArticle[] = [];
      
      for (const query of queries) {
        try {
          const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=15&format=json&sort=datedesc`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data.articles) {
              allArticles.push(...data.articles);
            }
          }
        } catch {
          // Individual query failed, continue
        }
      }

      // Deduplicate by title similarity and map to GlobeEvents
      const seen = new Set<string>();
      const globeEvents: GlobeEvent[] = [];

      for (const article of allArticles) {
        const shortTitle = article.title?.substring(0, 50);
        if (!shortTitle || seen.has(shortTitle)) continue;
        seen.add(shortTitle);

        const countryCode = article.sourcecountry?.toUpperCase().substring(0, 2);
        const coords = countryCoords[countryCode] || {
          lat: (Math.random() - 0.5) * 120,
          lng: (Math.random() - 0.5) * 300,
        };

        const { type, severity } = classifyEvent(article.title);

        globeEvents.push({
          id: `gdelt-${globeEvents.length}`,
          type,
          title: article.title,
          description: `Source: ${article.domain || 'Unknown'}`,
          lat: coords.lat + (Math.random() - 0.5) * 2,
          lng: coords.lng + (Math.random() - 0.5) * 2,
          severity,
          timestamp: article.seendate ? new Date(article.seendate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z')).toISOString() : new Date().toISOString(),
          source: article.domain || 'GDELT',
          metadata: { url: article.url, image: article.socialimage },
        });
      }

      if (globeEvents.length > 0) {
        setEvents(globeEvents);
      }
    } catch {
      // GDELT API failed, keep existing events
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchEvents, refreshInterval]);

  return { events, loading, refetch: fetchEvents };
}
