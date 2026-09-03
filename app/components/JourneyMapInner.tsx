"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import {
  DENSE_ROUTE,
  getRouteForStageProgress,
} from "../../data/route-coordinates";

interface Segment {
  id: string;
  lat: number;
  lng: number;
  title: string;
  text: string;
  image: string;
  location?: string;
  distance?: string;
  country?: string;
  elevation?: string;
}

interface JourneyMapInnerProps {
  stageProgress: number; // 0.0 to segments.length - 1
  activeSegmentIndex: number;
  segments: Segment[];
  onMarkerClick?: (index: number) => void;
}

export default function JourneyMapInner({
  stageProgress,
  activeSegmentIndex,
  segments,
  onMarkerClick,
}: JourneyMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const basePolylineRef = useRef<L.Polyline | null>(null);
  const activePolylineRef = useRef<L.Polyline | null>(null);
  const walkerMarkerRef = useRef<L.Marker | null>(null);
  const waypointMarkersRef = useRef<L.Marker[]>([]);
  const prevActiveIndexRef = useRef<number>(-1);

  // Keep callback reference updated without re-initializing map
  const onMarkerClickRef = useRef(onMarkerClick);
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  // 1. Initialize Map ONCE on component mount
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create map centered over Western Europe
    const map = L.map(mapContainerRef.current, {
      center: [46.5, 6.0],
      zoom: 6,
      minZoom: 4,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false, // Don't hijack page scroll
    });

    // 100% free OpenStreetMap tiles - NO API KEY required
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Initial bounds fitting UK (South Heath) through Rome
    const southHeathLatLng = L.latLng(51.7105, -0.6865);
    const romeLatLng = L.latLng(41.9022, 12.4568);
    const bounds = L.latLngBounds([southHeathLatLng, romeLatLng]);
    map.fitBounds(bounds, { padding: [40, 40] });

    // Base background trail line (faint dashed line showing total path)
    const fullRouteLatLngs = DENSE_ROUTE.map(([lat, lng]) => L.latLng(lat, lng));
    const basePolyline = L.polyline(fullRouteLatLngs, {
      color: "#64748b",
      weight: 4,
      dashArray: "6, 8",
      opacity: 0.5,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);
    basePolylineRef.current = basePolyline;

    // Active progressive route line (vibrant orange, drawn as user scrolls)
    const activePolyline = L.polyline([], {
      color: "#ea580c",
      weight: 5,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);
    activePolylineRef.current = activePolyline;

    // Walker pulsing marker at the head of the path
    const walkerIcon = L.divIcon({
      className: "leaflet-walker-marker",
      html: `
        <div class="walker-pulse-ring"></div>
        <div class="walker-pin"></div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    const startCoord = segments[0]
      ? [segments[0].lat, segments[0].lng]
      : [51.7105, -0.6865];
    const walkerMarker = L.marker([startCoord[0], startCoord[1]], {
      icon: walkerIcon,
      zIndexOffset: 1000,
    }).addTo(map);
    walkerMarkerRef.current = walkerMarker;

    // Waypoint markers for each segment stop
    const markers: L.Marker[] = [];
    segments.forEach((seg, idx) => {
      const nodeIcon = L.divIcon({
        className: "custom-waypoint-icon",
        html: `<div id="waypoint-node-${idx}" class="waypoint-node ${idx === 0 ? "active" : ""}"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const m = L.marker([seg.lat, seg.lng], { icon: nodeIcon }).addTo(map);

      m.bindTooltip(
        `<div class="text-xs font-semibold text-stone-900">${seg.title}</div><div class="text-[10px] text-stone-500">${seg.location || ""}</div>`,
        { direction: "top", offset: [0, -10] }
      );

      m.on("click", () => {
        if (onMarkerClickRef.current) {
          onMarkerClickRef.current(idx);
        }
      });

      markers.push(m);
    });
    waypointMarkersRef.current = markers;

    mapInstanceRef.current = map;

    // Cleanup strictly on unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [segments]);

  // 2. Smoothly update drawn route line on stageProgress changes (zero reload)
  useEffect(() => {
    if (!activePolylineRef.current || !walkerMarkerRef.current) {
      return;
    }

    const { activePoints, currentTip } = getRouteForStageProgress(stageProgress);
    const activeLatLngs = activePoints.map(([lat, lng]) => L.latLng(lat, lng));

    // Update polyline path coordinates
    activePolylineRef.current.setLatLngs(activeLatLngs);

    // Update walker position precisely at current tip
    walkerMarkerRef.current.setLatLng(L.latLng(currentTip[0], currentTip[1]));
  }, [stageProgress]);

  // 3. Update waypoint marker styling & smooth pan when active stage changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Update waypoint visual classes
    waypointMarkersRef.current.forEach((_, idx) => {
      const el = document.getElementById(`waypoint-node-${idx}`);
      if (el) {
        if (idx === activeSegmentIndex) {
          el.className = "waypoint-node active";
        } else if (idx < activeSegmentIndex) {
          el.className = "waypoint-node passed";
        } else {
          el.className = "waypoint-node";
        }
      }
    });

    // Gentle pan to target coordinate so walker & active segment stay centered
    if (
      prevActiveIndexRef.current !== activeSegmentIndex &&
      segments[activeSegmentIndex]
    ) {
      prevActiveIndexRef.current = activeSegmentIndex;
      const targetSeg = segments[activeSegmentIndex];

      map.panTo([targetSeg.lat, targetSeg.lng], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [activeSegmentIndex, segments]);

  // Map control buttons
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const southHeathLatLng = L.latLng(51.7105, -0.6865);
    const romeLatLng = L.latLng(41.9022, 12.4568);
    map.flyToBounds(L.latLngBounds([southHeathLatLng, romeLatLng]), {
      padding: [40, 40],
      duration: 1.0,
    });
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const activeSegment = segments[activeSegmentIndex];
  const progressPercent = Math.round(
    (stageProgress / Math.max(1, segments.length - 1)) * 100
  );

  return (
    <div className="relative w-full h-full bg-stone-200">
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Action Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-stone-900/85 backdrop-blur-md p-1.5 rounded-xl border border-stone-700/80 shadow-lg">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom In"
          className="w-8 h-8 flex items-center justify-center text-stone-200 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom Out"
          className="w-8 h-8 flex items-center justify-center text-stone-200 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="h-px bg-stone-700 mx-1 my-0.5" />
        <button
          onClick={handleRecenter}
          title="Reset View to Full Journey"
          aria-label="Reset View"
          className="w-8 h-8 flex items-center justify-center text-stone-200 hover:text-orange-400 hover:bg-stone-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Live Active Stop & Progress Pill on bottom left of map */}
      <div className="absolute bottom-4 left-4 z-20 bg-stone-900/90 backdrop-blur-md border border-stone-700/80 px-3.5 py-2.5 rounded-xl text-white shadow-lg flex flex-col gap-1.5 max-w-[260px] sm:max-w-[320px]">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-orange-400">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span>
              Stage {activeSegmentIndex + 1} of {segments.length}
            </span>
          </div>
          <span className="font-mono text-stone-400">{progressPercent}%</span>
        </div>

        {activeSegment && (
          <div className="text-xs font-medium text-stone-200 truncate">
            {activeSegment.location || activeSegment.title}
          </div>
        )}

        <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
