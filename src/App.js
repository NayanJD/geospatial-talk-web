import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { get } from "lodash";
import axios from "axios";
import * as turf from "@turf/turf";
import mapboxgl from "mapbox-gl/dist/mapbox-gl-csp";
// eslint-disable-next-line import/no-webpack-loader-syntax
import MapboxWorker from "worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker";
import logo from "./logo.svg";

import { useLocationUpdate } from "./hooks";
import { FactoryForm } from "./form";

import {
  separateInsideOutsidePoints,
  initializeMap,
  getPointsGeoJson,
  setFence,
} from "./utils";
import "./App.css";
import "react-toggle/style.css";

mapboxgl.workerClass = MapboxWorker;
mapboxgl.accessToken =
  "pk.eyJ1IjoibmF5YW5qIiwiYSI6ImNrbmFtZTVhcTBwMTcyeGxjOTE0N3AyMHMifQ._pHKxQv0HuH4HvnYygGJZg";

function App() {
  const mapContainer = useRef();
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(15);
  const [map, setMap] = useState(null);
  const [hasMapLoaded, setHasMapLoaded] = useState(false);
  const [factoryObj, setFactoryObj] = useState(null);
  const [factory, setFactory] = useState(null);
  const factoryId = get(factory, "id");
  const [shouldSubscribe, setShouldSubscribe] = useState(false);
  const [shouldShowAllPoints, setShouldShowAllPoints] = useState(false);
  const [distance, setDistance] = useState(0);

  const coordsObj = useLocationUpdate(
    factoryId,
    shouldSubscribe,
    shouldShowAllPoints,
    distance
  );

  const [insideCoords, outsideCoords] = separateInsideOutsidePoints(coordsObj);

  const handleFactoryOptions = (factory) => {
    setFactory(factory);
  };

  const handleSubscribeToggle = (shouldSubscribeValue) => {
    setShouldSubscribe(shouldSubscribeValue);
  };

  const handleAllPointsToggle = (shouldShowAllPointsValue) => {
    // if(!shouldShowAllPointsValue){
    //   outsideCoords=[]
    // }
    setShouldShowAllPoints(shouldShowAllPointsValue);
  };

  const handleDistanceChange = (distance) => {
    setDistance(distance);
  };

  const handleResetPoints = () => {
    if (map && hasMapLoaded) {
      const insideSource = map.getSource("insidePoint");
      const outsideSource = map.getSource("outsidePoint");

      if (insideSource) {
        insideSource.setData(getPointsGeoJson([]));
      }

      if (outsideSource) {
        outsideSource.setData(getPointsGeoJson([]));
      }
    }
  };

  useEffect(() => {
    // console.log(lat, lng);

    axios
      .post("http://127.0.0.1:8000/api/token", {
        username: "nayan2",
        password: "password",
      })
      .then((res) => {
        const token = res.data.access;

        axios
          .get("http://127.0.0.1:8000/api/factory", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((factories) => {
            const factoriesObj = {};
            for (let factory of factories.data) {
              factoriesObj[factory.id] = factory;
            }

            setFactoryObj(factoriesObj);
          });
      });

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      // center: center.geometry.coordinates,
      center: [77.5946, 12.9716],
      zoom: zoom,
    });

    newMap.on("load", function () {
      setHasMapLoaded(true);

      initializeMap(newMap, insideCoords, outsideCoords);
    });
    setMap(newMap);
    return () => map && map.remove();
  }, []);

  useEffect(() => {
    if (factory) {
      const coordinates = factory.geofence.coordinates[0];

      const center = turf.center(turf.points(coordinates));
      const flyToCoords = center.geometry.coordinates;
      if (map) {
        // map.flyTo({
        //   center: flyToCoords,
        // });
        map.panTo(flyToCoords);
        setFence(map, [coordinates]);
      }
    }
  }, [factoryId]);

  if (map && hasMapLoaded) {
    const insideSource = map.getSource("insidePoint");
    const outsideSource = map.getSource("outsidePoint");

    if (insideSource) {
      insideSource.setData(getPointsGeoJson(insideCoords));
    }

    if (outsideSource) {
      if (shouldShowAllPoints)
        outsideSource.setData(getPointsGeoJson(outsideCoords));
      else outsideSource.setData(getPointsGeoJson([]));
    }
  }

  console.log("shouldSubscribe ", shouldSubscribe);
  return (
    <div>
      <div className="sidebar">
        <FactoryForm
          factoryObj={factoryObj}
          handleChange={handleFactoryOptions}
          handleSubscribeChange={handleSubscribeToggle}
          handleAllPointsChange={handleAllPointsToggle}
          handleDistanceChange={handleDistanceChange}
          handleResetPoints={handleResetPoints}
        />
      </div>
      <div className="map-container" ref={mapContainer} />
    </div>
  );
}

export default App;
