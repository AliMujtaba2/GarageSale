import React, { createContext, useState } from "react";

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [liveCoords, setLiveCoords] = useState(null);

  return (
    <LocationContext.Provider value={{ liveCoords, setLiveCoords }}>
      {children}
    </LocationContext.Provider>
  );
};
