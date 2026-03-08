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
  allies?: string[];
  startYear: number;
  casualties: string;
  description: string;
  lat: number;
  lng: number;
  recentEvents: string[];
  lastUpdated: string;
  timeline?: { date: string; event: string }[];
}

export const ACTIVE_CONFLICTS: ActiveConflict[] = [
  {
    id: 'war-1', name: 'Russia-Ukraine War', region: 'Eastern Europe', status: 'active',
    parties: ['Russia', 'Ukraine', 'NATO (support)'],
    allies: ['NATO', 'EU', 'USA', 'UK', 'Poland', 'Baltics'],
    startYear: 2022, casualties: '500,000+ (est.)',
    description: 'Full-scale invasion of Ukraine by Russian forces. Ongoing frontline combat across Donetsk, Zaporizhzhia, and Kherson oblasts. Largest European conflict since WWII.',
    lat: 48.4, lng: 37.8, lastUpdated: new Date().toISOString(),
    recentEvents: ['Drone strikes on energy infrastructure', 'Frontline advances near Pokrovsk', 'Long-range missile attacks on Kyiv', 'F-16 operations commence'],
    timeline: [
      { date: '2022-02', event: 'Russia launches full-scale invasion' },
      { date: '2022-04', event: 'Withdrawal from Kyiv, Bucha massacre discovered' },
      { date: '2022-09', event: 'Ukraine recaptures Kharkiv Oblast' },
      { date: '2022-11', event: 'Kherson liberated' },
      { date: '2023-06', event: 'Ukrainian counteroffensive begins' },
      { date: '2024-02', event: 'Avdiivka falls to Russian forces' },
      { date: '2024-08', event: 'Ukraine incursion into Kursk Oblast' },
      { date: '2025-03', event: 'Intense fighting around Pokrovsk' },
      { date: '2026-01', event: 'Long-range strikes on Russian territory intensify' },
    ],
  },
  {
    id: 'war-2', name: 'Israel-Hamas / Gaza War', region: 'Middle East', status: 'active',
    parties: ['Israel (IDF)', 'Hamas', 'Hezbollah', 'Iran (proxy)'],
    allies: ['USA', 'UK', 'Egypt (mediator)', 'Qatar (mediator)'],
    startYear: 2023, casualties: '45,000+ (est.)',
    description: 'Military operation in Gaza following Oct 7 attack. Expanded to include exchanges with Hezbollah in Lebanon and direct strikes with Iran.',
    lat: 31.5, lng: 34.5, lastUpdated: new Date().toISOString(),
    recentEvents: ['IDF operations in Rafah', 'Rocket barrages intercepted by Iron Dome', 'Hostage negotiations ongoing', 'Ceasefire talks collapse'],
    timeline: [
      { date: '2023-10', event: 'Hamas October 7 attack - 1,200 killed' },
      { date: '2023-10', event: 'IDF launches Operation Swords of Iron' },
      { date: '2024-01', event: 'ICJ genocide case filed' },
      { date: '2024-04', event: 'Iran launches 300+ missiles at Israel' },
      { date: '2024-10', event: 'Hezbollah leader Nasrallah killed' },
      { date: '2025-01', event: 'Temporary ceasefire collapses' },
      { date: '2026-02', event: 'US-Iran tensions escalate to strikes' },
    ],
  },
  {
    id: 'war-3', name: 'US-Iran Conflict', region: 'Middle East / Persian Gulf', status: 'escalating',
    parties: ['United States', 'Israel', 'Iran', 'Houthis', 'Iraqi Militias'],
    allies: ['NATO', 'GCC states', 'UK', 'France'],
    startYear: 2024, casualties: '5,000+ (est.)',
    description: 'Escalating military confrontation following Iranian nuclear program advances and proxy attacks. US strikes on Iranian military facilities.',
    lat: 32.0, lng: 53.0, lastUpdated: new Date().toISOString(),
    recentEvents: ['US airstrikes on Iranian missile sites', 'Strait of Hormuz tensions', 'Houthi attacks on US naval assets', 'Iran successor crisis'],
    timeline: [
      { date: '2024-04', event: 'Iran-Israel direct military exchange' },
      { date: '2025-06', event: 'Iran enriches uranium to 90%' },
      { date: '2025-12', event: 'US repositions carrier groups to Gulf' },
      { date: '2026-01', event: 'US launches strikes on Iranian targets' },
      { date: '2026-03', event: 'Khamenei successor crisis unfolds' },
    ],
  },
  {
    id: 'war-4', name: 'Sudan Civil War', region: 'East Africa', status: 'active',
    parties: ['SAF (Sudanese Armed Forces)', 'RSF (Rapid Support Forces)'],
    allies: ['Egypt (SAF)', 'UAE (RSF alleged)', 'Russia (Wagner)'],
    startYear: 2023, casualties: '15,000+ dead, 8M+ displaced',
    description: 'Civil war between SAF and RSF paramilitaries. Massive humanitarian crisis with famine conditions. Worst displacement crisis globally.',
    lat: 15.6, lng: 32.5, lastUpdated: new Date().toISOString(),
    recentEvents: ['Fighting intensifies in El Fasher', 'Aid convoys blocked', 'Mass displacement to Chad', 'Famine declared in Darfur'],
    timeline: [
      { date: '2023-04', event: 'War erupts in Khartoum' },
      { date: '2023-11', event: 'RSF captures most of Darfur' },
      { date: '2024-06', event: 'Famine conditions declared' },
      { date: '2025-01', event: 'El Fasher siege begins' },
    ],
  },
  {
    id: 'war-5', name: 'Myanmar Civil War', region: 'Southeast Asia', status: 'active',
    parties: ['Myanmar Military (Tatmadaw)', 'Resistance Forces (NUG/PDF)', 'Ethnic Armed Orgs'],
    allies: ['China (both sides)', 'Russia (Junta)', 'India (neutral)'],
    startYear: 2021, casualties: '50,000+ (est.)',
    description: 'Armed resistance to 2021 military coup. Resistance forces control significant territory. Junta losing ground rapidly.',
    lat: 19.7, lng: 96.1, lastUpdated: new Date().toISOString(),
    recentEvents: ['Resistance captures Lashio', 'Junta airstrikes on civilians', 'Conscription law resistance', 'Operation 1027 gains'],
    timeline: [
      { date: '2021-02', event: 'Military coup ousts elected government' },
      { date: '2021-05', event: 'NUG forms shadow government' },
      { date: '2023-10', event: 'Operation 1027 launched by Three Brotherhood Alliance' },
      { date: '2024-08', event: 'Resistance captures Lashio' },
    ],
  },
  {
    id: 'war-6', name: 'Ethiopia - Internal Conflicts', region: 'East Africa', status: 'active',
    parties: ['Ethiopian Federal Forces', 'Fano militia', 'OLA'],
    startYear: 2020, casualties: '600,000+ (Tigray war)',
    description: 'Post-Tigray ceasefire but new conflicts in Amhara and Oromia regions.',
    lat: 9.0, lng: 38.7, lastUpdated: new Date().toISOString(),
    recentEvents: ['Fano militia clashes in Amhara', 'State of emergency declared', 'Humanitarian access restricted'],
    timeline: [
      { date: '2020-11', event: 'Tigray war begins' },
      { date: '2022-11', event: 'Pretoria ceasefire agreement' },
      { date: '2023-08', event: 'Amhara conflict escalates' },
    ],
  },
  {
    id: 'war-7', name: 'Syria Ongoing Conflict', region: 'Middle East', status: 'active',
    parties: ['Syrian Govt', 'HTS/Opposition', 'SDF/Kurds', 'Turkey', 'Russia', 'Iran'],
    allies: ['Russia (Assad)', 'Iran (Assad)', 'Turkey (Opposition)', 'USA (SDF)'],
    startYear: 2011, casualties: '500,000+ dead',
    description: 'Multi-sided civil war with international involvement. Recent rebel advances reshaping control map.',
    lat: 35.0, lng: 38.0, lastUpdated: new Date().toISOString(),
    recentEvents: ['HTS offensive in Idlib', 'Turkish operations against SDF', 'Russian airstrikes continue'],
    timeline: [
      { date: '2011-03', event: 'Syrian uprising begins' },
      { date: '2015-09', event: 'Russia intervenes militarily' },
      { date: '2019-10', event: 'Turkey launches Operation Peace Spring' },
      { date: '2024-12', event: 'Major HTS offensive captures territory' },
    ],
  },
  {
    id: 'war-8', name: 'Sahel Insurgency', region: 'West Africa', status: 'active',
    parties: ['JNIM', 'ISGS', 'Mali/Burkina/Niger militaries', 'Wagner Group'],
    startYear: 2012, casualties: '100,000+',
    description: 'Jihadist insurgency across Mali, Burkina Faso, and Niger. French forces withdrew, replaced by Wagner/Africa Corps.',
    lat: 14.0, lng: -2.0, lastUpdated: new Date().toISOString(),
    recentEvents: ['Mass attacks in Burkina Faso', 'Wagner operations in Mali', 'Civilian massacres reported'],
    timeline: [
      { date: '2012-01', event: 'Tuareg rebellion in northern Mali' },
      { date: '2013-01', event: 'French Operation Serval begins' },
      { date: '2022-08', event: 'France withdraws from Mali' },
      { date: '2023-07', event: 'Niger military coup' },
    ],
  },
  {
    id: 'war-9', name: 'Taiwan Strait Tensions', region: 'East Asia', status: 'escalating',
    parties: ['China (PLA)', 'Taiwan', 'USA (support)'],
    allies: ['USA', 'Japan', 'Australia (AUKUS)', 'Philippines'],
    startYear: 2022, casualties: 'N/A (no combat yet)',
    description: 'Intensifying military posturing around Taiwan. Frequent PLA air and naval incursions. US arms sales and military support.',
    lat: 24.5, lng: 121.0, lastUpdated: new Date().toISOString(),
    recentEvents: ['Record PLA aircraft sorties around Taiwan', 'US carrier group deployed to region', 'Joint China-Russia naval drills', 'Taiwan defense budget surge'],
    timeline: [
      { date: '2022-08', event: 'Pelosi visit triggers PLA exercises' },
      { date: '2024-01', event: 'Taiwan presidential election' },
      { date: '2025-04', event: 'PLA encirclement drills' },
      { date: '2026-01', event: 'US increases military presence' },
    ],
  },
  {
    id: 'war-10', name: 'Nagorno-Karabakh / S. Caucasus', region: 'Caucasus', status: 'frozen',
    parties: ['Azerbaijan', 'Armenia', 'Russia (peacekeepers withdrawn)'],
    startYear: 2020, casualties: '10,000+',
    description: 'Azerbaijan recaptured Nagorno-Karabakh in 2023. Ethnic Armenian population displaced. Ongoing border disputes.',
    lat: 39.8, lng: 46.8, lastUpdated: new Date().toISOString(),
    recentEvents: ['Complete ethnic Armenian displacement', 'Azerbaijan-Armenia peace talks', 'Russian peacekeepers withdraw'],
    timeline: [
      { date: '2020-09', event: '44-day war begins' },
      { date: '2020-11', event: 'Ceasefire, Russia deploys peacekeepers' },
      { date: '2023-09', event: 'Azerbaijan captures all of Karabakh' },
    ],
  },
];

export function useRealTimeNews(refreshInterval = 90000) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
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
      const seen = new Set<string>();
      const unique = allArticles.filter(a => {
        const key = a.title.substring(0, 40);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (unique.length > 0) setNews(unique.slice(0, 50));
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
