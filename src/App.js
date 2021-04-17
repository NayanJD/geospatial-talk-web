import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl/dist/mapbox-gl-csp";
// eslint-disable-next-line import/no-webpack-loader-syntax
import MapboxWorker from "worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker";
import logo from "./logo.svg";

import { useLocationUpdate } from "./hooks";
import "./App.css";

mapboxgl.workerClass = MapboxWorker;
mapboxgl.accessToken =
  "pk.eyJ1IjoibmF5YW5qIiwiYSI6ImNrbmFtZTVhcTBwMTcyeGxjOTE0N3AyMHMifQ._pHKxQv0HuH4HvnYygGJZg";

function App() {
  const mapContainer = useRef();
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(1);
  const [map, setMap] = useState(null);
  const [hasMapLoaded, setHasMapLoaded] = useState(false);

  const { latitude, longitude, userId } = useLocationUpdate();

  console.log("latitude ", latitude);

  useEffect(() => {
    console.log(lat, lng);
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lat, lng],
      zoom: zoom,
    });
    newMap.on("load", function () {
      setHasMapLoaded(true);
    });
    setMap(newMap);
    return () => map && map.remove();
  }, []);

  console.log(hasMapLoaded);
  if (map && hasMapLoaded) {
    console.log("Fly to...");
    // map.flyTo({
    //   center: [latitude, longitude],
    // });

    const source = map.getSource("point");

    if (source) {
      source.setData({
        type: "Point",
        coordinates: [latitude, longitude],
      });
      // map.panTo([latitude, longitude]);
    } else {
      map.addSource("point", {
        type: "geojson",
        data: {
          type: "Point",
          coordinates: [latitude, longitude],
        },
      });

      map.addLayer({
        id: "circle",
        type: "circle",
        source: "point",
        paint: {
          "circle-color": "#4264fb",
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
    }
  }

  return (
    <div>
      <div className="map-container" ref={mapContainer} />
    </div>
  );
}

export default App;
