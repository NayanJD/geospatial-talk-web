import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { reduce } from "lodash";
import * as turf from "@turf/turf";
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
  const [zoom, setZoom] = useState(12);
  const [map, setMap] = useState(null);
  const [hasMapLoaded, setHasMapLoaded] = useState(false);

  const coordsObj = useLocationUpdate();

  console.log("coords ", coordsObj);

  useEffect(() => {
    // console.log(lat, lng);

    const center = turf.center(
      turf.points([
        [77.54392057656997, 12.993270144209049],
        [77.64207333326016, 12.994299874874102],
        [77.64424860477226, 12.943409350986244],
        [77.53959953784693, 12.941738961793646],
        [77.54392057656997, 12.993270144209049],
      ])
    );

    console.log("center:: ", center.geometry.coordinates);

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: center.geometry.coordinates,
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
        type: "MultiPoint",
        coordinates: reduce(
          coordsObj,
          (arr, coord) => {
            arr.push([coord.latitude, coord.longitude]);

            return arr;
          },
          []
        ),
      });
      // map.panTo([latitude, longitude]);
    } else {
      map.addSource("point", {
        type: "geojson",
        data: {
          type: "MultiPoint",
          coordinates: reduce(
            coordsObj,
            (arr, coord) => {
              arr.push([coord.latitude, coord.longitude]);

              return arr;
            },
            []
          ),
        },
      });

      map.addSource("polygon", {
        type: "geojson",
        data: {
          type: "Polygon",
          coordinates: [
            [
              [77.54392057656997, 12.993270144209049],
              [77.64207333326016, 12.994299874874102],
              [77.64424860477226, 12.943409350986244],
              [77.53959953784693, 12.941738961793646],
              [77.54392057656997, 12.993270144209049],
            ],
          ],
        },
      });

      map.addLayer({
        id: "outline",
        type: "line",
        source: "polygon",
        layout: {},
        paint: {
          "line-color": "#000",
          "line-width": 3,
        },
      });

      map.addLayer({
        id: "circle",
        type: "circle",
        source: "point",
        paint: {
          "circle-color": "#4264fb",
          "circle-radius": 3,
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
