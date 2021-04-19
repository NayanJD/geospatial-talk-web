import React, { useEffect, useState } from "react";

export const useLocationUpdate = () => {
  const [ws, setWs] = useState(null);
  // const [lat, setLat] = useState(null);
  // const [long, setLong] = useState(null);
  const [coords, setCoords] = useState([]);
  const [coordsObj, setCoordsObj] = useState({});
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const newWs = new WebSocket("ws://127.0.0.1:8000/ws/factory");

    newWs.onmessage = function (event) {
      //   console.log(event);
      var msg = JSON.parse(event.data);

      switch (msg.type) {
        case "location_update":
          if (msg.is_success) {
            const { longitude, latitude, user_id: userId } = msg.data;

            coordsObj[userId] = {
              latitude,
              longitude,
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

    return () => ws && ws.close();
  }, []);

  // console.log(coords);
  return coordsObj;
};
