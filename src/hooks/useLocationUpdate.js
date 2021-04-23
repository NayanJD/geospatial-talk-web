import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { forEach } from "lodash";

export const useLocationUpdate = () => {
  const [ws, setWs] = useState(null);
  // const [lat, setLat] = useState(null);
  // const [long, setLong] = useState(null);
  const [coords, setCoords] = useState([]);
  const [coordsObj, setCoordsObj] = useState({});
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const newWs = new WebSocket(
      "ws://127.0.0.1:8000/ws/factory/f2e4c51e-0947-4864-ab81-eeaace5a2c65"
    );

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

            setCoordsObj({ ...coordsObj });
            // setLat(msg.data.latitude);
            // setLong(msg.data.longitude);
            // setUserId(msg.data.userId);
          }
          break;
        default:
      }
    };

    setWs(newWs);

    // const pointCheckInterval = setInterval(() => {
    //   const cleanedUpCoordsObj = {};
    //   let isChanged = false;
    //   // console.log("coordsObj:: ", coordsObj);
    //   forEach(coordsObj, (coords, userId) => {
    //     isChanged = true;
    //     const now = dayjs();

    //     // console.log("diff:: ", now.diff(coords.timestamp, "second"));

    //     if (now.diff(coords.timestamp, "second") < 2) {
    //       cleanedUpCoordsObj[userId] = coords;
    //     }
    //   });
    //   // console.log("cleanedUpCoordsObj:: ", cleanedUpCoordsObj);
    //   if (isChanged) {
    //     // console.log("Setting up cleaned coords");
    //     setCoordsObj(cleanedUpCoordsObj);
    //   }
    // }, 2000);

    return () => {
      ws && ws.close();
      // clearInterval(pointCheckInterval);
    };
  }, []);

  useEffect(() => {
    const pointCheckInterval = setInterval(() => {
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
      // console.log("cleanedUpCoordsObj:: ", cleanedUpCoordsObj);
      if (isChanged) {
        // console.log("Setting up cleaned coords");
        setCoordsObj(cleanedUpCoordsObj);
      }
    }, 2000);

    return () => clearInterval(pointCheckInterval);
  }, [coordsObj]);

  // console.log("outside coordsObj:: ", coordsObj);
  return coordsObj;
};
