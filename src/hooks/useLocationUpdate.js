import React, { useEffect, useState } from "react";

export const useLocationUpdate = () => {
  const [ws, setWs] = useState(null);
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const newWs = new WebSocket("ws://127.0.0.1:8000/ws/factory");

    newWs.onmessage = function (event) {
      //   console.log(event);
      var msg = JSON.parse(event.data);

      switch (msg.type) {
        case "location_update":
          if (msg.is_success) {
            setLat(msg.data.latitude);
            setLong(msg.data.longitude);
            setUserId(msg.data.userId);
          }
          break;
        default:
      }
    };

    setWs(newWs);

    return () => ws && ws.close();
  }, []);

  //   console.log(lat);
  return {
    latitude: lat,
    longitude: long,
    userId,
  };
};
