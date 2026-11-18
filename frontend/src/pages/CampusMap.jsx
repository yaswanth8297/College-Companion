import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  Polygon,
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Search, 
  ArrowUpDown, 
  RotateCcw, 
  Share2, 
  Accessibility, 
  Clock, 
  Footprints, 
  CheckCircle,
  Building,
  Info,
  Layers,
  Play,
  Pause,
  Locate,
  Sparkles,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Coffee,
  Activity,
  Award,
  Filter
} from 'lucide-react';
import { getLocations, calculateRoute, getPathways } from '../services/api';

// Center of Dr. Lankapalli Bullayya College of Engineering campus (Visakhapatnam)
const CAMPUS_CENTER = [17.7314, 83.3155];

// Map Layer Tile Providers - Standard OpenStreetMap (no API key required) and ESRI Satellite
const TILE_LAYERS = {
  osm: {
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    name: 'Satellite Aerial View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
  }
};

// Verified College Campus Building Footprints (Block 8, Block 7, Admin, Library, Canteen, Auditorium)
const CAMPUS_BUILDING_FOOTPRINTS = [
  {
    slug: 'block_8',
    name: 'Block 8 (CSE, ECE, EEE & Staff Room)',
    color: '#EF83B9',
    fillColor: '#F6C2D3',
    coordinates: [
      [17.73175, 83.31520],
      [17.73205, 83.31520],
      [17.73205, 83.31550],
      [17.73175, 83.31550]
    ],
    floors: {
      'Ground Floor': ['Computer Center & Labs', 'Main Entrance Lobby', 'Elevator & Staircase Access', 'Notice Boards'],
      '1st Floor': ['CSE Department (Computer Science & Engineering)', 'Staff Room (Beside the lift)', 'Advanced Programming Lab', 'AI Systems Lab'],
      '2nd Floor': ['ECE Department (Electronics & Communication Engineering)', 'Microprocessors & Embedded Systems Lab', 'VLSI Design Lab', 'Faculty Cabins'],
      '3rd Floor': ['EEE Department (Electrical & Electronics Engineering)', 'Power Systems & Electrical Machines Lab', 'Smart Lecture Halls']
    }
  },
  {
    slug: 'block_7',
    name: 'Block 7 (Civil Engineering)',
    color: '#9DCD59',
    fillColor: '#D4E9B3',
    coordinates: [
      [17.73225, 83.31545],
      [17.73255, 83.31545],
      [17.73255, 83.31575],
      [17.73225, 83.31575]
    ],
    floors: {
      'Ground Floor': ['Strength of Materials Lab', 'Surveying Equipment Store', 'Materials Testing Lab'],
      '1st Floor': ['Structural Analysis Lab', 'Department Classrooms 7-101 to 7-104'],
      '2nd Floor': ['Geotechnical & Transportation Engineering Labs', 'Environmental Engineering Lab'],
      '3rd Floor': ['Civil Engineering Department Office', 'HOD Chamber', 'CAD & Structural Design Lab', 'Department Seminar Room']
    }
  },
  {
    slug: 'admin_block',
    name: 'Administrative & Principal Block',
    color: '#EF83B9',
    fillColor: '#F4B1C8',
    coordinates: [
      [17.73105, 83.31522],
      [17.73135, 83.31522],
      [17.73135, 83.31548],
      [17.73105, 83.31548]
    ],
    floors: {
      'Ground Floor': ['Admissions Counseling Desk', 'Accounts & Fee Counter', 'Visitor Waiting Lobby', 'Exam Cell'],
      '1st Floor': ["Principal's Chamber", 'Secretary & Correspondent Office', 'Dr. Sarvepalli Radhakrishnan Seminar Hall', 'Board Room']
    }
  },
  {
    slug: 'library',
    name: 'Dr. Lankapalli Bullayya Central Library',
    color: '#9DCD59',
    fillColor: '#F0EEE6',
    coordinates: [
      [17.73145, 83.31495],
      [17.73175, 83.31495],
      [17.73175, 83.31520],
      [17.73145, 83.31520]
    ],
    floors: {
      'Ground Floor': ['Book Circulation Counter', 'Reference Section (35,000+ volumes)', 'Newspaper & Journal Reading Lounge'],
      '1st Floor': ['Digital Library & IEEE E-Resource Terminals', 'Air-Conditioned Quiet Study Hall', 'Research Scholar Desks']
    }
  },
  {
    slug: 'canteen',
    name: 'College Canteen',
    color: '#EF83B9',
    fillColor: '#F6C2D3',
    coordinates: [
      [17.73208, 83.31555],
      [17.73232, 83.31555],
      [17.73232, 83.31585],
      [17.73208, 83.31585]
    ],
    floors: {
      'Ground Floor': ['Main Dining Hall', 'Juice & Beverage Counter', 'Faculty Dining Lounge', 'Snacks & Tiffin Station']
    }
  },
  {
    slug: 'auditorium',
    name: 'Prof. K. Ramakrishna Rao Auditorium',
    color: '#9DCD59',
    fillColor: '#F4B1C8',
    coordinates: [
      [17.73088, 83.31555],
      [17.73112, 83.31555],
      [17.73112, 83.31585],
      [17.73088, 83.31585]
    ],
    floors: {
      'Ground Floor': ['800-Seater Main Auditorium', 'Acoustic Stage & Dolby Sound Console', 'Green Rooms & VIP Lounge']
    }
  }
];

// Curated Campus Tours for instant navigation
const PRESET_CAMPUS_TOURS = [
  {
    id: 'tour_b8',
    title: 'Block 8 (CSE / ECE / EEE)',
    description: 'Main Gate to Block 8',
    origin: 'main_gate',
    dest: 'block_8'
  },
  {
    id: 'tour_b7',
    title: 'Block 7 (Civil Engineering)',
    description: 'Main Gate to Block 7',
    origin: 'main_gate',
    dest: 'block_7'
  },
  {
    id: 'tour_staff',
    title: 'Staff Room (Block 8, 1st Flr)',
    description: 'Main Gate to Staff Room (beside lift)',
    origin: 'main_gate',
    dest: 'staff_room'
  },
  {
    id: 'tour_lib',
    title: 'Central Library',
    description: 'Block 8 to Central Library',
    origin: 'block_8',
    dest: 'library'
  },
  {
    id: 'tour_canteen',
    title: 'College Canteen',
    description: 'Block 8 to Canteen',
    origin: 'block_8',
    dest: 'canteen'
  }
];

// Strict brand color assignments for categories
const CATEGORY_COLORS = {
  gate: '#9DCD59',       // Green
  academic: '#EF83B9',   // Accent Pink
  admin: '#EF83B9',      // Accent Pink
  facility: '#9DCD59',   // Green
  lab: '#EF83B9',        // Accent Pink
  sports: '#9DCD59',     // Green
  parking: '#F4B1C8',    // Pink 2
  amenity: '#9DCD59'     // Green
};

// Custom Leaflet DivIcon generator
const createMarkerIcon = (category, label, isDestination = false, isOrigin = false) => {
  let bgColor = CATEGORY_COLORS[category] || '#EF83B9';
  let ringClasses = 'border-white';
  let badgeText = label ? label.substring(0, 2).toUpperCase() : '•';
  let pulseHtml = '';

  if (isOrigin) {
    bgColor = '#9DCD59';
    ringClasses = 'border-white ring-4 ring-[#9DCD59]/50 scale-110';
    pulseHtml = '<span class="absolute -top-1 -right-1 w-3 h-3 bg-[#9DCD59] rounded-full animate-ping"></span>';
  } else if (isDestination) {
    bgColor = '#EF83B9';
    ringClasses = 'border-white ring-4 ring-[#EF83B9]/50 scale-110';
    pulseHtml = '<span class="absolute -top-1 -right-1 w-3 h-3 bg-[#EF83B9] rounded-full animate-ping"></span>';
  }

  return L.divIcon({
    className: 'custom-campus-pin',
    html: `
      <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125">
        ${pulseHtml}
        <div class="w-8 h-8 rounded-full shadow-md flex items-center justify-center text-white text-[11px] font-black border-2 ${ringClasses}" style="background-color: ${bgColor}">
          ${badgeText}
        </div>
        <div class="absolute -bottom-1 w-2.5 h-2.5 rotate-45 shadow-sm" style="background-color: ${bgColor}"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Moving walking avatar marker for animation
const createWalkingAvatarIcon = () => {
  return L.divIcon({
    className: 'walking-avatar-pin',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <span class="absolute w-8 h-8 rounded-full bg-[#9DCD59] opacity-75 animate-ping"></span>
        <div class="w-7 h-7 rounded-full bg-[#1A1C1E] text-white flex items-center justify-center text-sm shadow-xl border-2 border-[#9DCD59]">
          🚶
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

// Map Lifecycle Component: Prevents tile glitches and updates view
function MapLifecycleHandler({ center, zoom, bounds }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    const container = map.getContainer();
    if (container) resizeObserver.observe(container);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [map]);

  useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 19 });
      } catch (e) {
        map.setView(center || CAMPUS_CENTER, zoom || 18);
      }
    } else if (center) {
      map.setView(center, zoom || 18, { animate: true });
    }
  }, [center, zoom, bounds, map]);

  return null;
}

export default function CampusMap() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [locations, setLocations] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [originId, setOriginId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [wheelchairOnly, setWheelchairOnly] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedBuildingFootprint, setSelectedBuildingFootprint] = useState(null);
  const [activeFloor, setActiveFloor] = useState('Ground Floor');
  const [copiedLink, setCopiedLink] = useState(false);
  const [mapCenter, setMapCenter] = useState(CAMPUS_CENTER);
  const [mapZoom, setMapZoom] = useState(18);
  const [routeBounds, setRouteBounds] = useState(null);
  const [currentTileLayer, setCurrentTileLayer] = useState('osm');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  
  // Walking Animation Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStepIndex, setSimStepIndex] = useState(0);
  const [avatarCoord, setAvatarCoord] = useState(null);
  const simTimerRef = useRef(null);

  const navigate = useNavigate();

  // Load locations and pathways
  useEffect(() => {
    async function loadMapData() {
      try {
        setLoading(true);
        const [locsData, pathsData] = await Promise.all([
          getLocations('', true),
          getPathways()
        ]);
        setLocations(locsData);
        setPathways(pathsData);

        const fromParam = searchParams.get('from');
        const toParam = searchParams.get('to');

        let initialOrigin = locsData.find(l => l.slug === 'main_gate')?.id || '';
        let initialDest = '';

        if (fromParam) {
          const matchedFrom = locsData.find(l => l.slug === fromParam || l.id.toString() === fromParam);
          if (matchedFrom) initialOrigin = matchedFrom.id;
        }

        if (toParam) {
          const matchedTo = locsData.find(l => l.slug === toParam || l.id.toString() === toParam);
          if (matchedTo) {
            initialDest = matchedTo.id;
            setSelectedLocation(matchedTo);
            const footprint = CAMPUS_BUILDING_FOOTPRINTS.find(b => b.slug === matchedTo.slug);
            if (footprint) setSelectedBuildingFootprint(footprint);
          }
        }

        setOriginId(initialOrigin);
        setDestinationId(initialDest);

        if (initialOrigin && initialDest) {
          triggerRoute(initialOrigin, initialDest, false);
        }
      } catch (err) {
        console.error('Failed to load campus navigation data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, []);

  // Trigger route calculation
  const triggerRoute = async (startId, endId, accessible) => {
    if (!startId || !endId || startId === endId) return;
    try {
      setRouteLoading(true);
      const data = await calculateRoute(startId, endId, accessible);
      setActiveRoute(data);

      if (data.coordinates && data.coordinates.length > 0) {
        setRouteBounds(data.coordinates);
      }
    } catch (err) {
      console.error('Routing calculation failed:', err);
      alert('Could not compute a path between the selected points.');
    } finally {
      setRouteLoading(false);
    }
  };

  const handleRouteSubmit = () => {
    if (originId && destinationId) {
      triggerRoute(originId, destinationId, wheelchairOnly);
      const origObj = locations.find(l => l.id === parseInt(originId));
      const destObj = locations.find(l => l.id === parseInt(destinationId));
      if (origObj && destObj) {
        setSearchParams({ from: origObj.slug, to: destObj.slug });
      }
    }
  };

  const handleSwap = () => {
    const temp = originId;
    setOriginId(destinationId);
    setDestinationId(temp);
    if (destinationId && temp) {
      triggerRoute(destinationId, temp, wheelchairOnly);
    }
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
    setDestinationId('');
    setRouteBounds(null);
    setSearchParams({});
    stopWalkingSimulation();
  };

  const handleLocateUser = () => {
    const gate = locations.find(l => l.slug === 'main_gate');
    if (gate) {
      setOriginId(gate.id);
      setMapCenter([gate.latitude, gate.longitude]);
      setMapZoom(19);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRecenter = () => {
    setMapCenter(CAMPUS_CENTER);
    setMapZoom(18);
    setRouteBounds(null);
  };

  // Walking simulation controls
  const startWalkingSimulation = () => {
    if (!activeRoute || !activeRoute.coordinates || activeRoute.coordinates.length === 0) return;
    setIsSimulating(true);
    let idx = 0;
    setSimStepIndex(0);
    setAvatarCoord(activeRoute.coordinates[0]);

    if (simTimerRef.current) clearInterval(simTimerRef.current);

    simTimerRef.current = setInterval(() => {
      idx += 1;
      if (idx >= activeRoute.coordinates.length) {
        clearInterval(simTimerRef.current);
        setIsSimulating(false);
      } else {
        setSimStepIndex(idx);
        setAvatarCoord(activeRoute.coordinates[idx]);
        setMapCenter(activeRoute.coordinates[idx]);
      }
    }, 1200);
  };

  const stopWalkingSimulation = () => {
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    setIsSimulating(false);
    setAvatarCoord(null);
    setSimStepIndex(0);
  };

  // Launch preset tour
  const launchTour = (tour) => {
    const origObj = locations.find(l => l.slug === tour.origin);
    const destObj = locations.find(l => l.slug === tour.dest);
    if (origObj && destObj) {
      setOriginId(origObj.id);
      setDestinationId(destObj.id);
      setSelectedLocation(destObj);
      const footprint = CAMPUS_BUILDING_FOOTPRINTS.find(b => b.slug === destObj.slug);
      if (footprint) setSelectedBuildingFootprint(footprint);
      triggerRoute(origObj.id, destObj.id, false);
      setSearchParams({ from: tour.origin, to: tour.dest });
    }
  };

  // Filter locations
  const filteredLocations = locations.filter(l => {
    const matchesCategory = selectedCategory === 'ALL' || l.category === selectedCategory;
    const matchesQuery = !searchQuery || 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.block_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#F0EEE6]">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-[#E3DFD3] px-4 py-3 z-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#EF83B9] text-white">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-extrabold text-[#1A1C1E] tracking-tight">
                  Smart Campus Navigation
                </h1>
                <span className="text-[10px] bg-[#9DCD59] text-[#1A1C1E] px-2 py-0.5 rounded-md font-bold">
                  Active Map
                </span>
              </div>
              <p className="text-xs text-[#4A5568]">
                Dr. Lankapalli Bullayya College of Engineering • Interactive Campus Map
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Tile Layer Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLayerMenu(!showLayerMenu)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#1A1C1E] border border-[#E3DFD3] hover:border-[#EF83B9] flex items-center space-x-1.5 transition-colors"
                title="Switch Map Tile Styles"
              >
                <Layers className="w-3.5 h-3.5 text-[#EF83B9]" />
                <span>{TILE_LAYERS[currentTileLayer].name}</span>
              </button>
              {showLayerMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-[#E3DFD3] p-1.5 z-50">
                  {Object.entries(TILE_LAYERS).map(([key, layer]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setCurrentTileLayer(key);
                        setShowLayerMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg font-medium flex items-center justify-between ${
                        currentTileLayer === key ? 'bg-[#F6C2D3] text-[#1A1C1E] font-bold' : 'hover:bg-[#F0EEE6] text-[#1A1C1E]'
                      }`}
                    >
                      <span>{layer.name}</span>
                      {currentTileLayer === key && <CheckCircle className="w-3.5 h-3.5 text-[#EF83B9]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step-Free Accessibility Toggle */}
            <button
              onClick={() => {
                const newWc = !wheelchairOnly;
                setWheelchairOnly(newWc);
                if (originId && destinationId) triggerRoute(originId, destinationId, newWc);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
                wheelchairOnly
                  ? 'bg-[#9DCD59] text-[#1A1C1E] border-[#9DCD59]'
                  : 'bg-white text-[#1A1C1E] border-[#E3DFD3] hover:bg-[#F0EEE6]'
              }`}
            >
              <Accessibility className="w-3.5 h-3.5" />
              <span>Step-Free Accessible</span>
            </button>

            {/* Geolocation / Snap to Gate */}
            <button
              onClick={handleLocateUser}
              className="p-2 rounded-lg text-xs font-semibold bg-white text-[#1A1C1E] border border-[#E3DFD3] hover:border-[#EF83B9] transition-colors"
              title="Locate my position / Snap to Main Gate"
            >
              <Locate className="w-4 h-4 text-[#EF83B9]" />
            </button>

            {/* Share Route */}
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#1A1C1E] border border-[#E3DFD3] hover:border-[#EF83B9] flex items-center space-x-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-[#EF83B9]" />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            {/* Recenter */}
            <button
              onClick={handleRecenter}
              className="p-2 rounded-lg text-xs font-semibold bg-white text-[#1A1C1E] border border-[#E3DFD3] hover:bg-[#F0EEE6]"
              title="Recenter Map View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {activeRoute && (
              <button
                onClick={handleClearRoute}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#EF83B9] hover:bg-[#D9529B] text-white transition-colors"
              >
                Clear Route
              </button>
            )}
          </div>
        </div>

        {/* Quick Tour Presets Strip */}
        <div className="max-w-7xl mx-auto pt-2.5 mt-2 border-t border-[#E3DFD3] flex items-center space-x-2 overflow-x-auto text-xs pb-0.5">
          <span className="font-bold text-[#1A1C1E] text-xs shrink-0 flex items-center mr-1">
            <Sparkles className="w-3.5 h-3.5 text-[#EF83B9] mr-1" />
            Quick Routes:
          </span>
          {PRESET_CAMPUS_TOURS.map(tour => (
            <button
              key={tour.id}
              onClick={() => launchTour(tour)}
              className="px-3 py-1 bg-[#F4B1C8] hover:bg-[#F6C2D3] border border-[#EF83B9]/40 rounded-full text-[#1A1C1E] font-semibold shrink-0 transition-colors flex items-center space-x-1"
            >
              <span>{tour.title}</span>
              <ChevronRight className="w-3 h-3 text-[#1A1C1E]" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Navigation Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Left Sidebar: Direction Planner & Steps */}
        <div className="w-full lg:w-96 bg-white border-r border-[#E3DFD3] flex flex-col z-20 shrink-0 max-h-[85vh] lg:max-h-none overflow-y-auto">
          {/* Route Planner Form */}
          <div className="p-4 border-b border-[#E3DFD3] bg-[#F4B1C8]/20 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E] flex items-center justify-between">
              <span>Walking Route Planner</span>
              <span className="text-[10px] text-[#1A1C1E] font-bold bg-[#9DCD59] px-2 py-0.5 rounded-md">
                Verified Routes
              </span>
            </span>

            {/* Origin */}
            <div>
              <label className="text-xs font-semibold text-[#1A1C1E] block mb-1">
                Starting Location
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 w-3 h-3 rounded-full bg-[#9DCD59] ring-2 ring-white"></span>
                <select
                  value={originId}
                  onChange={(e) => setOriginId(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white rounded-lg border border-[#E3DFD3] text-[#1A1C1E] focus:outline-none focus:border-[#EF83B9]"
                >
                  <option value="">Select starting point...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.block_name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-1">
              <button
                type="button"
                onClick={handleSwap}
                className="p-1 rounded-full bg-[#F0EEE6] border border-[#E3DFD3] text-[#1A1C1E] hover:text-[#EF83B9] hover:bg-white transition-colors"
                title="Swap origin and destination"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Destination */}
            <div>
              <label className="text-xs font-semibold text-[#1A1C1E] block mb-1">
                Destination Building / Facility
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 w-3 h-3 rounded-full bg-[#EF83B9] ring-2 ring-white"></span>
                <select
                  value={destinationId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDestinationId(val);
                    const selected = locations.find(l => l.id === parseInt(val));
                    if (selected) {
                      setSelectedLocation(selected);
                      const footprint = CAMPUS_BUILDING_FOOTPRINTS.find(b => b.slug === selected.slug);
                      if (footprint) setSelectedBuildingFootprint(footprint);
                    }
                  }}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white rounded-lg border border-[#E3DFD3] text-[#1A1C1E] focus:outline-none focus:border-[#EF83B9]"
                >
                  <option value="">Select destination...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.block_name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleRouteSubmit}
              disabled={!originId || !destinationId || routeLoading}
              className="w-full py-2.5 px-4 bg-[#EF83B9] hover:bg-[#D9529B] disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              {routeLoading ? (
                <span>Calculating route...</span>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Navigate To Destination</span>
                </>
              )}
            </button>
          </div>

          {/* Route Summary & Walking Simulation HUD */}
          {activeRoute ? (
            <div className="p-4 space-y-4 flex-1">
              {/* Metrics Card */}
              <div className="p-3.5 bg-[#9DCD59]/20 border border-[#9DCD59] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wider flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-[#1A1C1E]" />
                    Walking Route
                  </span>
                  {activeRoute.wheelchair_accessible && (
                    <span className="text-[10px] font-bold bg-[#9DCD59] text-[#1A1C1E] px-2 py-0.5 rounded-md">
                      Step-Free
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-[#1A1C1E]">
                  <span className="flex items-center space-x-1">
                    <Footprints className="w-4 h-4 text-[#1A1C1E]" />
                    <span>{activeRoute.total_distance_meters} meters</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-[#1A1C1E]" />
                    <span>~{activeRoute.estimated_minutes} min walk</span>
                  </span>
                </div>

                {/* Animated Simulation Player */}
                <div className="pt-2 border-t border-[#9DCD59]/40 flex items-center justify-between">
                  <span className="text-xs font-medium text-[#1A1C1E]">
                    Walk Simulation:
                  </span>
                  {!isSimulating ? (
                    <button
                      onClick={startWalkingSimulation}
                      className="px-2.5 py-1 bg-[#1A1C1E] text-white hover:bg-[#333] rounded-md text-xs font-bold flex items-center space-x-1"
                    >
                      <Play className="w-3 h-3 text-[#9DCD59]" />
                      <span>Start Walk</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopWalkingSimulation}
                      className="px-2.5 py-1 bg-[#EF83B9] text-white hover:bg-[#D9529B] rounded-md text-xs font-bold flex items-center space-x-1"
                    >
                      <Pause className="w-3 h-3" />
                      <span>Stop Walk</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Turn-by-turn steps list */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E] mb-2.5">
                  Walking Directions
                </h3>
                <ol className="relative border-l-2 border-[#E3DFD3] ml-3 space-y-3.5">
                  {activeRoute.detailed_steps.map((step, idx) => (
                    <li key={idx} className="ml-4">
                      <span className={`absolute -left-2.5 flex items-center justify-center w-5 h-5 rounded-full text-[10px] text-white font-black ${
                        idx === 0 
                          ? 'bg-[#9DCD59]' 
                          : idx === activeRoute.detailed_steps.length - 1 
                          ? 'bg-[#EF83B9]' 
                          : 'bg-[#1A1C1E]'
                      }`}>
                        {idx + 1}
                      </span>
                      <p className="text-xs text-[#1A1C1E] leading-relaxed font-semibold">
                        {step.instruction}
                      </p>
                      {step.distance > 0 && (
                        <span className="text-[11px] text-[#4A5568] font-normal block mt-0.5">
                          Continue for {step.distance} meters
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Multi-Floor Directory Preview if destination has floors */}
              {selectedBuildingFootprint && selectedBuildingFootprint.floors && (
                <div className="p-3.5 bg-[#F6C2D3]/20 rounded-xl border border-[#F4B1C8] space-y-2">
                  <h4 className="text-xs font-bold text-[#1A1C1E] flex items-center justify-between">
                    <span>{selectedBuildingFootprint.name} Floors</span>
                    <span className="text-[10px] text-[#1A1C1E] font-bold bg-[#F4B1C8] px-1.5 py-0.5 rounded">Directory</span>
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(selectedBuildingFootprint.floors).map(floor => (
                      <button
                        key={floor}
                        onClick={() => setActiveFloor(floor)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                          activeFloor === floor
                            ? 'bg-[#EF83B9] text-white'
                            : 'bg-white text-[#1A1C1E] border border-[#E3DFD3]'
                        }`}
                      >
                        {floor}
                      </button>
                    ))}
                  </div>
                  <div className="text-[11px] text-[#1A1C1E] bg-white p-2 rounded-lg border border-[#E3DFD3]">
                    <span className="font-bold text-[#1A1C1E] block mb-1">{activeFloor}:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {selectedBuildingFootprint.floors[activeFloor]?.map((room, rIdx) => (
                        <li key={rIdx}>{room}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Destination Explorer & Filter by Category */
            <div className="p-4 space-y-3 flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E] block">
                Campus Locations ({filteredLocations.length})
              </span>

              {/* Filter Categories */}
              <div className="flex flex-wrap gap-1">
                {[
                  { label: 'All', value: 'ALL' },
                  { label: 'Academic', value: 'academic' },
                  { label: 'Labs', value: 'lab' },
                  { label: 'Admin', value: 'admin' },
                  { label: 'Facilities', value: 'facility' }
                ].map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      selectedCategory === cat.value
                        ? 'bg-[#EF83B9] text-white'
                        : 'bg-[#F0EEE6] text-[#1A1C1E] hover:bg-[#F6C2D3]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#1A1C1E] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by building or room..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F0EEE6] rounded-lg border border-[#E3DFD3] text-[#1A1C1E] focus:outline-none focus:border-[#EF83B9]"
                />
              </div>

              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {filteredLocations.map((loc) => {
                  const catColor = CATEGORY_COLORS[loc.category] || '#EF83B9';
                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setDestinationId(loc.id);
                        setMapCenter([loc.latitude, loc.longitude]);
                        setMapZoom(19);
                        const footprint = CAMPUS_BUILDING_FOOTPRINTS.find(b => b.slug === loc.slug);
                        if (footprint) setSelectedBuildingFootprint(footprint);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                        destinationId === loc.id
                          ? 'bg-[#F6C2D3] border-[#EF83B9] font-bold'
                          : 'bg-white border-[#E3DFD3] hover:border-[#EF83B9]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: catColor }}
                        ></span>
                        <div>
                          <h4 className="font-bold text-[#1A1C1E]">{loc.name}</h4>
                          <p className="text-[11px] text-[#4A5568]">{loc.block_name} • {loc.floor_level}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#1A1C1E]" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Area: Interactive Leaflet Map */}
        <div className="flex-1 h-[550px] lg:h-auto relative z-10">
          <MapContainer
            center={CAMPUS_CENTER}
            zoom={18}
            maxZoom={20}
            minZoom={15}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            {/* Dynamic Tile Layer (OpenStreetMap default) */}
            <TileLayer
              attribution={TILE_LAYERS[currentTileLayer].attribution}
              url={TILE_LAYERS[currentTileLayer].url}
            />

            {/* Lifecycle handler to prevent container glitches */}
            <MapLifecycleHandler center={mapCenter} zoom={mapZoom} bounds={routeBounds} />

            {/* Campus Building 2D Footprint Polygons (Block 8, Block 7, etc.) */}
            {CAMPUS_BUILDING_FOOTPRINTS.map((b) => (
              <Polygon
                key={b.slug}
                positions={b.coordinates}
                pathOptions={{
                  color: b.color,
                  fillColor: b.fillColor,
                  fillOpacity: selectedBuildingFootprint?.slug === b.slug ? 0.75 : 0.45,
                  weight: selectedBuildingFootprint?.slug === b.slug ? 3 : 2
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedBuildingFootprint(b);
                    const matchedLoc = locations.find(l => l.slug === b.slug);
                    if (matchedLoc) {
                      setSelectedLocation(matchedLoc);
                      setDestinationId(matchedLoc.id);
                      if (originId) triggerRoute(originId, matchedLoc.id, wheelchairOnly);
                    }
                  }
                }}
              >
                <Popup>
                  <div className="p-1 max-w-xs font-sans space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded" style={{ backgroundColor: b.color }}>
                      Building
                    </span>
                    <h4 className="font-bold text-sm text-[#1A1C1E]">{b.name}</h4>
                    <p className="text-xs text-[#1A1C1E]">Click below to set this building as your walking destination.</p>
                    <button
                      onClick={() => {
                        const matchedLoc = locations.find(l => l.slug === b.slug);
                        if (matchedLoc) {
                          setDestinationId(matchedLoc.id);
                          if (originId) triggerRoute(originId, matchedLoc.id, wheelchairOnly);
                        }
                      }}
                      className="w-full py-1.5 bg-[#EF83B9] text-white text-xs font-bold rounded-md hover:bg-[#D9529B] transition-colors"
                    >
                      Navigate Here
                    </button>
                  </div>
                </Popup>
              </Polygon>
            ))}

            {/* Inactive Pathway Grid */}
            {pathways.map((p) => {
              const fromLoc = locations.find(l => l.id === p.from_node_id);
              const toLoc = locations.find(l => l.id === p.to_node_id);
              if (!fromLoc || !toLoc) return null;
              return (
                <Polyline
                  key={`path-${p.id}`}
                  positions={[
                    [fromLoc.latitude, fromLoc.longitude],
                    [toLoc.latitude, toLoc.longitude]
                  ]}
                  color="#EF83B9"
                  weight={2}
                  dashArray="4, 4"
                  opacity={0.4}
                />
              );
            })}

            {/* Active Route Polyline */}
            {activeRoute && activeRoute.coordinates && (
              <>
                <Polyline
                  positions={activeRoute.coordinates}
                  color="#FFFFFF"
                  weight={8}
                  opacity={0.9}
                />
                <Polyline
                  positions={activeRoute.coordinates}
                  color="#EF83B9"
                  weight={5}
                  opacity={1.0}
                />
              </>
            )}

            {/* Animated Walking Avatar Marker (During Simulation) */}
            {avatarCoord && (
              <Marker position={avatarCoord} icon={createWalkingAvatarIcon()} zIndexOffset={1000} />
            )}

            {/* Campus Landmark Markers */}
            {locations.map((loc) => {
              const isOrig = activeRoute && activeRoute.origin.id === loc.id;
              const isDest = activeRoute && activeRoute.destination.id === loc.id;

              return (
                <Marker
                  key={loc.id}
                  position={[loc.latitude, loc.longitude]}
                  icon={createMarkerIcon(loc.category, loc.name, isDest, isOrig)}
                  eventHandlers={{
                    click: () => {
                      setSelectedLocation(loc);
                      const footprint = CAMPUS_BUILDING_FOOTPRINTS.find(b => b.slug === loc.slug);
                      if (footprint) setSelectedBuildingFootprint(footprint);
                      if (!originId) {
                        setOriginId(loc.id);
                      } else if (!destinationId && originId !== loc.id) {
                        setDestinationId(loc.id);
                        triggerRoute(originId, loc.id, wheelchairOnly);
                      }
                    }
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-2 max-w-xs font-sans">
                      <div className="border-b border-[#E3DFD3] pb-1">
                        <span className="text-[10px] uppercase font-bold text-[#EF83B9] block">
                          {loc.category}
                        </span>
                        <h4 className="font-bold text-sm text-[#1A1C1E]">{loc.name}</h4>
                        <p className="text-xs text-[#4A5568]">{loc.block_name} • {loc.floor_level}</p>
                      </div>

                      <p className="text-xs text-[#1A1C1E] leading-relaxed">
                        {loc.description || 'Campus building/facility.'}
                      </p>

                      {loc.accessibility_info && (
                        <p className="text-[11px] text-[#1A1C1E] flex items-center font-medium bg-[#9DCD59]/20 p-1 rounded">
                          <Accessibility className="w-3.5 h-3.5 mr-1 text-[#1A1C1E]" />
                          <span>{loc.accessibility_info}</span>
                        </p>
                      )}

                      <div className="pt-2 flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setDestinationId(loc.id);
                            if (originId) triggerRoute(originId, loc.id, wheelchairOnly);
                          }}
                          className="px-3 py-1.5 bg-[#EF83B9] text-white text-xs font-bold rounded-md hover:bg-[#D9529B] transition-colors"
                        >
                          Navigate Here
                        </button>
                        <button
                          onClick={() => setOriginId(loc.id)}
                          className="px-3 py-1.5 bg-[#F0EEE6] text-[#1A1C1E] text-xs font-semibold rounded-md hover:bg-[#E3DFD3] border border-[#E3DFD3] transition-colors"
                        >
                          Set as Start
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Floating Compass HUD Card */}
          <div className="absolute top-4 right-4 z-20 bg-white p-3 rounded-xl border border-[#E3DFD3] shadow-md text-xs space-y-1.5 hidden sm:block max-w-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1A1C1E] text-xs uppercase tracking-wider flex items-center">
                <Compass className="w-3.5 h-3.5 text-[#EF83B9] mr-1" />
                Campus Navigator
              </span>
              <span className="text-[9px] bg-[#9DCD59] text-[#1A1C1E] px-1.5 py-0.5 rounded font-bold">
                Live
              </span>
            </div>
            {activeRoute ? (
              <div className="space-y-1 text-[#1A1C1E]">
                <p className="font-bold text-[#1A1C1E] truncate">
                  To: {activeRoute.destination.name}
                </p>
                <div className="flex items-center space-x-3 text-xs font-bold text-[#1A1C1E]">
                  <span>{activeRoute.total_distance_meters}m</span>
                  <span>~{activeRoute.estimated_minutes} min walk</span>
                </div>
              </div>
            ) : (
              <p className="text-[#4A5568] text-xs">
                Click any building or path on the map to start navigation.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
