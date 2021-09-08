import { reduce, forEach, map } from "lodash";
import * as turf from "@turf/turf";
export function initializeMap(newMap, insideCoords, outsideCoords, Draw) {
  //Akanksha's
  // let _center = turf.point([77.55571494673643, 12.99083812808039]);

  //Illia
  let _center = turf.point([4.8056466, 52.4446596]);

  // let _radius = 5;
  let _options = {
    steps: 80,
    units: "kilometers", // or "mile"
  };

  let colorArr = ["black", "green", "blue", "orange", "red"];
  for (let i = 0; i < 5; i++) {
    let _radius = 5 + i * 5;
    let _circle = turf.circle(_center, _radius, _options);

    console.log("source ", `circleData${i}`);
    newMap.addSource(`circleData${i}`, {
      type: "geojson",
      data: _circle,
    });

    newMap.addLayer({
      id: `circleData${i}`,
      type: "fill",
      source: `circleData${i}`,
      paint: {
        "fill-color": colorArr[i],
        // "circle-color": "red",
        "fill-opacity": 0.1,
      },
    });

    // if (i === 0) {
    //   newMap.addLayer({
    //     id: "circle-fill",
    //     type: "fill",
    //     source: `circleData${i}`,
    //     paint: {
    //       "fill-color": colorArr[i],
    //       // "circle-color": "red",
    //       "fill-opacity": 0.2,
    //     },
    //   });
    // } else {
    //   newMap.addLayer(
    //     {
    //       id: "circle-fill",
    //       type: "fill",
    //       source: `circleData${i}`,
    //       paint: {
    //         "fill-color": colorArr[i],
    //         // "circle-color": "red",
    //         "fill-opacity": 0.2,
    //       },
    //     },
    //     `circleData${i - 1}`
    //   );
    // }
  }

  // newMap.moveLayer("circleData1", "circleData2");

  let insideCoordData = getPointsFeature(insideCoords);
  let outsideCoordData = getPointsFeature(outsideCoords);

  newMap.addSource("insidePoint", insideCoordData);

  // Add a symbol layer
  newMap.addLayer({
    id: "insidePointSymbol",
    type: "symbol",
    source: "insidePoint",
    layout: {
      "text-field": ["get", "title"],
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      "text-offset": [0, 1.25],
      "text-anchor": "top",
    },
  });

  newMap.addLayer({
    id: "insidePointCircle",
    type: "circle",
    source: "insidePoint",
    paint: {
      "circle-color": "#FF0000",
      "circle-radius": 6,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });

  newMap.addSource("outsidePoint", outsideCoordData);

  newMap.addLayer({
    id: "outsidePointCircle",
    type: "circle",
    source: "outsidePoint",
    paint: {
      "circle-color": "#4264fb",
      "circle-radius": 6,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });

  // Add a symbol layer
  newMap.addLayer({
    id: "outsidePointSymbol",
    type: "symbol",
    source: "outsidePoint",
    layout: {
      "text-field": ["get", "title"],
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      "text-offset": [0, 1.25],
      "text-anchor": "top",
    },
  });

  // newMap.addSource("externalPolygon", {
  //   type: "geojson",
  //   data: {
  //     type: "Polygon",
  //     coordinates: [
  //       [
  //         [77.56675674023597, 12.97777916687754],
  //         [77.56692073403116, 12.961793459025358],
  //         [77.60211549066315, 12.961951511517157],
  //         [77.60214669168914, 12.961913026626107],
  //         [77.60192255678578, 12.977782104468147],
  //         [77.60193778047483, 12.977759778778221],
  //         [77.57625692491092, 12.978035324664518],
  //         [77.56675674023597, 12.97777916687754],
  //       ],
  //     ],
  //   },
  // });
  // newMap.addSource("externalPolygon", {
  //   type: "geojson",
  //   data: {
  //     type: "Polygon",
  //     coordinates: [],
  //   },
  // });
  // newMap.addLayer({
  //   id: "externalPolygonOutline",
  //   type: "line",
  //   source: "externalPolygon",
  //   layout: {},
  //   paint: {
  //     "line-color": "#000",
  //     "line-width": 3,
  //   },
  // });

  newMap.addSource("internalPolygon", {
    type: "geojson",
    data: {
      type: "Polygon",
      coordinates: [],
    },
  });

  newMap.addLayer({
    id: "internalPolygonOutline",
    type: "line",
    source: "internalPolygon",
    layout: {},
    paint: {
      "line-color": "#FF0000",
      "line-width": 2,
    },
  });

  newMap.on("draw.create", updateArea(Draw));
  newMap.on("draw.update", updateArea(Draw));
  newMap.on("draw.delete", updateArea(Draw));
}

export function separateInsideOutsidePoints(coordsObj, isSubscribed) {
  const insideCoords = [],
    outsideCoords = [];

  forEach(coordsObj, (coord) => {
    if (coord.isInside && isSubscribed) {
      insideCoords.push(coord);
    } else {
      outsideCoords.push(coord);
    }
  });

  return [insideCoords, outsideCoords];
}

export function getPointsGeoJson(arr) {
  return {
    type: "FeatureCollection",
    features: map(arr, (coord) => {
      return {
        // feature for Mapbox DC
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [coord.latitude, coord.longitude],
        },
        properties: {
          title: coord.userId,
        },
      };
    }),
  };
}

export function getPointsFeature(arr) {
  return {
    type: "geojson",
    data: getPointsGeoJson(arr),
  };
}

export const setFence = (map, coordinates) => {
  console.log("coordinates:: ", coordinates);
  const internalPolygonSource = map.getSource("internalPolygon");
  internalPolygonSource.setData({
    type: "Polygon",
    coordinates,
  });
};

function updateArea(draw) {
  return (e) => {
    const data = draw.getAll();

    console.log("draw data ", JSON.stringify(data, null, 2));
  };
}
