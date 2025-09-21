import React, { useState, useRef, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import monasteriesData from "../assets/monastries.json"; // ✅ your JSON

const libraries = ["places"];
const mapContainerStyle = { width: "100%", height: "100vh" };
const center = { lat: 27.33, lng: 88.5 };
const options = { disableDefaultUI: false, zoomControl: true };

export default function MonasteryMap() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null); // ✅ for hover photo card
  const mapRef = useRef();
  const onMapLoad = useCallback((map) => (mapRef.current = map), []);

  const markerClick = (monastery) => {
    setSelected(monastery);
    mapRef.current?.panTo({ lat: monastery.lat, lng: monastery.lng });
    mapRef.current?.setZoom(13);
  };

  // SearchBox
  const searchBoxRef = useRef(null);
  const onSBLoad = (ref) => (searchBoxRef.current = ref);
  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (!places || places.length === 0) return;
    const p = places[0].geometry.location;
    mapRef.current.panTo({ lat: p.lat(), lng: p.lng() });
    mapRef.current.setZoom(12);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 320,
          overflowY: "auto",
          padding: 12,
          borderRight: "1px solid #ddd",
        }}
      >
        <h2>Monasteries — Sikkim</h2>

        <div style={{ marginBottom: 12 }}>
          <StandaloneSearchBox onLoad={onSBLoad} onPlacesChanged={onPlacesChanged}>
            <input
              type="text"
              placeholder="Search places (Gangtok, Pelling...)"
              style={{
                width: "100%",
                height: "40px",
                padding: "0 12px",
                border: "1px solid #ccc",
                borderRadius: 4,
                fontSize: 14,
              }}
            />
          </StandaloneSearchBox>
        </div>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {monasteriesData.map((m) => (
            <li key={m.id} style={{ marginBottom: 8 }}>
              <button
                onClick={() => markerClick(m)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                <strong>{m.name}</strong>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {m.district} • {m.sect}
                </div>
              </button>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 12, fontSize: 12, color: "#444" }}>
          Tip: Hover a marker for photo card, click for details & directions.
        </div>
      </aside>

      {/* Map */}
      <div style={{ flexGrow: 1 }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={10}
          center={center}
          options={options}
          onLoad={onMapLoad}
        >
          {monasteriesData.map((m) => (
            <Marker
              key={m.id}
              position={{ lat: m.lat, lng: m.lng }}
              onClick={() => setSelected(m)}
              onMouseOver={() => setHovered(m)}
              onMouseOut={() => setHovered(null)}
            />
          ))}

          {/* ✅ Hover Photo Frame Card */}
          {hovered && (
            <InfoWindow
              position={{ lat: hovered.lat, lng: hovered.lng }}
              options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
              onCloseClick={() => setHovered(null)}
            >
              <div
                style={{
                  cursor: "pointer",
                  textAlign: "center",
                  maxWidth: "160px",
                }}
                onClick={() => (window.location.href = hovered.detailPage)}
              >
                <img
                  src={hovered.photo}
                  alt={hovered.name}
                  style={{ width: "100%", borderRadius: "5px" }}
                />
                <h4 style={{ margin: "6px 0" }}>{hovered.name}</h4>
              </div>
            </InfoWindow>
          )}

          {/* ✅ Click Info */}
          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div style={{ maxWidth: 240 }}>
                <h3 style={{ margin: "0 0 6px 0" }}>{selected.name}</h3>
                <div style={{ fontSize: 13 }}>
                  {selected.district} • {selected.sect}
                </div>
                <p style={{ margin: "6px 0 0 0", fontSize: 13 }}>
                  {selected.notes}
                </p>
                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`;
                      window.open(url, "_blank");
                    }}
                    style={{ padding: "6px 8px", fontSize: 13 }}
                  >
                    Directions
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
