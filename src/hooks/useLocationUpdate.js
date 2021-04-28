import dayjs from "dayjs";
import React, { useEffect, useState, useCallback } from "react";
import { forEach, debounce } from "lodash";

export const useLocationUpdate = (
  factoryId,
  shouldSubscribe,
  shouldShowAllPoints,
  distance
) => {
  const [ws, setWs] = useState(null);
  // const [lat, setLat] = useState(null);
  // const [long, setLong] = useState(null);
  const [coords, setCoords] = useState([]);
  const [coordsObj, setCoordsObj] = useState({});
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let url;

    console.log("useLocationUpdate shouldSubscribe ", shouldSubscribe);
    console.log("useLocationUpdate shouldShowAllPoints ", shouldShowAllPoints);
    console.log("useLocationUpdate distance ", distance);
    if (factoryId && (shouldSubscribe || shouldShowAllPoints)) {
      if (distance) {
        url = `ws://127.0.0.1:8000/ws/factory/${factoryId}?distance=${distance}`;
      } else {
        url = `ws://127.0.0.1:8000/ws/factory/${factoryId}`;
      }
    } else {
      url = `ws://127.0.0.1:8000/ws/factory`;
    }
    const newWs = new WebSocket(url);

    newWs.onmessage = (event) => {
      //   console.log(event);
      var msg = JSON.parse(event.data);

      switch (msg.type) {
        case "location_update":
          if (msg.is_success) {
            const {
              longitude,
              latitude,
              user_id: userId,
              is_inside: isInside,
            } = msg.data;

            coordsObj[userId] = {
              latitude,
              longitude,
              isInside,
              userId,
              timestamp: dayjs().valueOf(),
            };

            const cleanedUpCoordsObj = {};
            let isChanged = false;
            // console.log("coordsObj:: ", coordsObj);
            forEach(coordsObj, (coords, userId) => {
              isChanged = true;
              const now = dayjs();

              // console.log("diff:: ", now.diff(coords.timestamp, "second"));

              if (now.diff(coords.timestamp, "second") < 2) {
                cleanedUpCoordsObj[userId] = coords;
              }
            });

            setCoordsObj(cleanedUpCoordsObj);
          }
          break;
        default:
      }
    };

    setWs(newWs);

    return () => {
      setCoordsObj({});
      newWs && newWs.close();
      // clearInterval(pointCheckInterval);
    };
  }, [factoryId, shouldSubscribe, shouldShowAllPoints, distance]);

  // useEffect(() => {
  //   const pointCheckInterval = setInterval(() => {
  //     // console.log(coordsObj);
  //     const cleanedUpCoordsObj = {};
  //     let isChanged = false;
  //     // console.log("coordsObj:: ", coordsObj);
  //     forEach(coordsObj, (coords, userId) => {
  //       isChanged = true;
  //       const now = dayjs();

  //       // console.log("diff:: ", now.diff(coords.timestamp, "second"));

  //       if (now.diff(coords.timestamp, "second") < 2) {
  //         cleanedUpCoordsObj[userId] = coords;
  //       }
  //     });
  //     // console.log("cleanedUpCoordsObj:: ", cleanedUpCoordsObj);
  //     if (isChanged) {
  //       // console.log("Setting up cleaned coords:: ", cleanedUpCoordsObj);
  //       setCoordsObj(cleanedUpCoordsObj);
  //     }
  //   }, 2000);

  //   return () => clearInterval(pointCheckInterval);
  // }, []);

  console.log("outside coordsObj:: ", coordsObj);
  return coordsObj;
};
