import { useState, useEffect, useCallback } from 'react';

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  image?: string;
  category: 'war' | 'military' | 'cyber' | 'geopolitical' | 'disaster' | 'protest';
  timestamp: string;
  region: string;
}

export interface ActiveConflict {
  id: string;
  name: string;
  region: string;
  status: 'active' | 'escalating' | 'ceasefire' | 'frozen';
  parties: string[];
  startYear: number;
  casualties: string;
  description: string;
  lat: number;
  lng: number;
  recentEvents: string[];
  lastUpdated: string;
}

// Real active conflicts with real data
export const ACTIVE_CONFLICTS: ActiveConflict[] = [
  {
    id: 'war-1', name: 'Russia-Ukraine War', region: 'Eastern Europe', status: 'active',
    parties: ['Russia', 'Ukraine', 'NATO (support)'], startYear: 2022, casualties: '500,000+ (est.)',
    description: 'Full-scale invasion of Ukraine by Russian forces. Ongoing frontline combat across Donetsk, Zaporizhzhia, and Kherson oblasts.',
    lat: 48.4, lng: 37.8, lastUpdated: new Date().toISOString(),
    recentEvents: ['Drone strikes on energy infrastructure', 'Frontline advances near Pokrovsk', 'Long-range missile attacks on Kyiv'],
  },
  {
    id: 'war-2', name: 'Israel-Hamas / Gaza War', region: 'Middle East', status: 'active',
    parties: ['Israel (IDF)', 'Hamas', 'Hezbollah', 'Iran (proxy)'], startYear: 2023, casualties: '45,000+ (est.)',
    description: 'Military operation in Gaza following Oct 7 attack. Expanded to include exchanges with Hezbollah in Lebanon.',
    lat: 31.5, lng: 34.5, lastUpdated: new Date().toISOString(),
    recentEvents: ['IDF operations in Rafah', 'Rocket barrages intercepted by Iron Dome', 'Hostage negotiations ongoing'],
  },
  {
    id: 'war-3', name: 'Sudan Civil War', region: 'East Africa', status: 'active',
    parties: ['SAF (Sudanese Armed Forces)', 'RSF (Rapid Support Forces)'], startYear: 2023, casualties: '15,000+ dead, 8M+ displaced',
    description: 'Civil war between SAF and RSF paramilitaries. Massive humanitarian crisis with famine conditions.',
    lat: 15.6, lng: 32.5, lastUpdated: new Date().toISOString(),
    recentEvents: ['Fighting intensifies in El Fasher', 'Aid convoys blocked', 'Mass displacement to Chad'],
  },
  {
    id: 'war-4', name: 'Myanmar Civil War', region: 'Southeast Asia', status: 'active',
    parties: ['Myanmar Military (Tatmadaw)', 'Resistance Forces (NUG/PDF)', 'Ethnic Armed Orgs'], startYear: 2021, casualties: '50,000+ (est.)',
    description: 'Armed resistance to 2021 military coup. Resistance forces control significant territory.',
    lat: 19.7, lng: 96.1, lastUpdated: new Date().toISOString(),
    recentEvents: ['Resistance captures Lashio', 'Junta airstrikes on civilians', 'Conscription law resistance'],
  },
  {
    id: 'war-5', name: 'Ethiopia - Internal Conflicts', region: 'East Africa', status: 'active',
    parties: ['Ethiopian Federal Forces', 'Fano militia', 'OLA'], startYear: 2020, casualties: '600,000+ (Tigray war)',
    description: 'Post-Tigray ceasefire but new conflicts in Amhara and Oromia regions.',
    lat: 9.0, lng: 38.7, lastUpdated: new Date().toISOString(),
    recentEvents: ['Fano militia clashes in Amhara', 'State of emergency declared', 'Humanitarian access restricted'],
  },
  {
    id: 'war-6', name: 'Syria Ongoing Conflict', region: 'Middle East', status: 'active',
    parties: ['Syrian Govt', 'HTS/Opposition', 'SDF/Kurds', 'Turkey', 'Russia', 'Iran'], startYear: 2011, casualties: '500,000+ dead',
    description: 'Multi-sided civil war with international involvement. Recent rebel advances in northwest.',
    lat: 35.0, lng: 38.0, lastUpdated: new Date().toISOString(),
    recentEvents: ['HTS offensive in Idlib', 'Turkish operations against SDF', 'Russian airstrikes continue'],
  },
  {
    id: 'war-7', name: 'Israel-Iran Shadow War', region: 'Middle East', status: 'escalating',
    parties: ['Israel', 'Iran', 'Hezbollah', 'Houthis'], startYear: 2024, casualties: 'Classified',
    description: 'Direct military exchanges between Israel and Iran. Proxy conflicts across region.',
    lat: 32.0, lng: 53.0, lastUpdated: new Date().toISOString(),
    recentEvents: ['Iranian missile barrage on Israel', 'Israeli strikes on Iranian facilities', 'Houthi Red Sea attacks'],
  },
  {
    id: 'war-8', name: 'Sahel Insurgency', region: 'West Africa', status: 'active',
    parties: ['JNIM', 'ISGS', 'Mali/Burkina/Niger militaries', 'Wagner Group'], startYear: 2012, casualties: '100,000+',
    description: 'Jihadist insurgency across Mali, Burkina Faso, and Niger. French forces withdrew, replaced by Wagner.',
    lat: 14.0, lng: -2.0, lastUpdated: new Date().toISOString(),
    recentEvents: ['Mass attacks in Burkina Faso', 'Wagner operations in Mali', 'Civilian massacres reported'],
  },
];

export function useRealTimeNews(refreshInterval = 90000) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      // Use GDELT for real news
      const queries = [
        '(war OR conflict OR military strike)',
        '(missile OR airstrike OR bombing)',
        '(cyber attack OR security breach)',
      ];
      
      const allArticles: NewsArticle[] = [];
      
      for (const query of queries) {
        try {
          const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=20&format=json&sort=datedesc`;
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            try {
              const data = JSON.parse(text);
              if (data.articles) {
                data.articles.forEach((a: any, i: number) => {
                  const t = (a.title || '').toLowerCase();
                  let category: NewsArticle['category'] = 'geopolitical';
                  if (t.includes('war') || t.includes('strike') || t.includes('bomb') || t.includes('attack') || t.includes('kill')) category = 'war';
                  else if (t.includes('military') || t.includes('troops') || t.includes('army') || t.includes('navy')) category = 'military';
                  else if (t.includes('cyber') || t.includes('hack') || t.includes('breach')) category = 'cyber';
                  else if (t.includes('protest') || t.includes('riot')) category = 'protest';
                  else if (t.includes('earthquake') || t.includes('flood') || t.includes('hurricane')) category = 'disaster';
                  
                  allArticles.push({
                    id: `news-${Date.now()}-${i}-${Math.random()}`,
                    title: a.title || 'Breaking News',
                    source: a.domain || 'Unknown',
                    url: a.url || '',
                    image: a.socialimage || '',
                    category,
                    timestamp: a.seendate ? new Date(a.seendate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z')).toISOString() : new Date().toISOString(),
                    region: a.sourcecountry || 'Global',
                  });
                });
              }
            } catch { /* not JSON */ }
          }
        } catch { /* query failed */ }
      }

      // Deduplicate by title similarity
      const seen = new Set<string>();
      const unique = allArticles.filter(a => {
        const key = a.title.substring(0, 40);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (unique.length > 0) {
        setNews(unique.slice(0, 50));
      }
    } catch { /* keep existing */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchNews, refreshInterval]);

  return { news, conflicts: ACTIVE_CONFLICTS, loading, refetch: fetchNews };
}
