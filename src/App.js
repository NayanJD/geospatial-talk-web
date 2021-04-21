import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { reduce, forEach } from "lodash";
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

function separateInsideOutsidePoints(coordsObj) {
  const insideCoords = [],
    outsideCoords = [];

  forEach(coordsObj, (coord) => {
    if (coord.isInside) {
      insideCoords.push([coord.latitude, coord.longitude]);
    } else {
      outsideCoords.push([coord.latitude, coord.longitude]);
    }
  });

  return [insideCoords, outsideCoords];
}

function App() {
  const mapContainer = useRef();
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(12);
  const [map, setMap] = useState(null);
  const [hasMapLoaded, setHasMapLoaded] = useState(false);

  const coordsObj = useLocationUpdate();

  const [insideCoords, outsideCoords] = separateInsideOutsidePoints(coordsObj);

  // console.log("insideCoords ", insideCoords);
  // console.log("outsideCoords ", outsideCoords);

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

  if (map && hasMapLoaded) {
    const insideSource = map.getSource("insidePoint");
    const outsideSource = map.getSource("outsidePoint");

    if (insideSource && outsideSource) {
      insideSource.setData({
        type: "MultiPoint",
        coordinates: insideCoords,
      });

      outsideSource.setData({
        type: "MultiPoint",
        coordinates: outsideCoords,
      });
      // map.panTo([latitude, longitude]);
    } else {
      map.addSource("insidePoint", {
        type: "geojson",
        data: {
          type: "MultiPoint",
          coordinates: insideCoords,
        },
      });
      map.addLayer({
        id: "insidePointCircle",
        type: "circle",
        source: "insidePoint",
        paint: {
          "circle-color": "#FF0000",
          "circle-radius": 4,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addSource("outsidePoint", {
        type: "geojson",
        data: {
          type: "MultiPoint",
          coordinates: outsideCoords,
        },
      });
      map.addLayer({
        id: "outsidePointCircle",
        type: "circle",
        source: "outsidePoint",
        paint: {
          "circle-color": "#4264fb",
          "circle-radius": 4,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addSource("externalPolygon", {
        type: "geojson",
        data: {
          type: "Polygon",
          coordinates: [
            [
              [77.56675674023597, 12.97777916687754],
              [77.56692073403116, 12.961793459025358],
              [77.60211549066315, 12.961951511517157],
              [77.60214669168914, 12.961913026626107],
              [77.60192255678578, 12.977782104468147],
              [77.60193778047483, 12.977759778778221],
              [77.57625692491092, 12.978035324664518],
              [77.56675674023597, 12.97777916687754],
            ],
          ],
        },
      });
      map.addLayer({
        id: "externalPolygonOutline",
        type: "line",
        source: "externalPolygon",
        layout: {},
        paint: {
          "line-color": "#000",
          "line-width": 3,
        },
      });

      map.addSource("internalPolygon", {
        type: "geojson",
        data: {
          type: "Polygon",
          coordinates: [
            [
              [77.5821887956082, 12.97670101824491],
              [77.57395774910214, 12.968812905868674],
              [77.58443109878624, 12.962938393986647],
              [77.59276977584443, 12.970796975410693],
              [77.59278479927548, 12.970742129648173],
              [77.58679628017819, 12.974586766461343],
              [77.5821887956082, 12.97670101824491],
            ],
          ],
        },
      });
      map.addLayer({
        id: "internalPolygonOutline",
        type: "line",
        source: "internalPolygon",
        layout: {},
        paint: {
          "line-color": "#FF0000",
          "line-width": 3,
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
