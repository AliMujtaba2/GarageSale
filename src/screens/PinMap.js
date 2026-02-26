import React, { useState, useRef, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import MapPickerSVG from "../svg/MapPickerSVG";
import { LocationContext } from "../context/contextapi/LiveLocationAPI";
import {useSelector } from "react-redux";
import { darkTheme, lightTheme } from "../constants/colors";

// Mapbox.setAccessToken() here

export default function MapPickerScreen({ navigation, route }) {
  const [centerCoords, setCenterCoords] = useState(null);
  const { liveCoords } = useContext(LocationContext);
  const cameraRef = useRef(null);
  const isDark = useSelector((state) => state.theme.theme === 'dark');
  const colors = isDark ? darkTheme : lightTheme;





  useEffect(() => {
    if (route.params?.LiveLocation) {
      const coords = route.params.LiveLocation;
      console.log("center coords in map Picker" + coords)
      setCenterCoords(coords);
    }else{
    const coords = [liveCoords.longitude, liveCoords.latitude]; // convert to array
    setCenterCoords(coords);

    }
  }, [route.params?.LiveLocation] , [liveCoords]);


  // Called whenever map region changes
  const handleRegionDidChange = async (feature) => {
     try {
    const center = feature.geometry.coordinates;

    // Ignore invalid (0,0) center
    if (center[0] === 0 && center[1] === 0) {
      console.log("⚠️ Ignored invalid center:", center);
      return;
    }

    console.log("📍 Center moved to:", center);
    setCenterCoords(center);
  } catch (err) {
    console.log("⚠️ Failed to get center:", err);
  }
  };


const handleConfirm = () => {
  if (centerCoords) {
    const callback = route.params?.onPick;
    if (callback) callback(centerCoords);  // ✅ send data back
    navigation.goBack();
  }
};

  return (
    <View style={styles.container}>
      
      <MapboxGL.MapView
        style={styles.map}
        styleURL={isDark ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street}
        onRegionDidChange={handleRegionDidChange}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={centerCoords}
        />
      </MapboxGL.MapView>


      {/* Fixed pin in the center */}
      <View style={styles.pinContainer} pointerEvents="none">
        <MapPickerSVG />
      </View>

      {/* Footer UI */}
      <View style={{...styles.footer, backgroundColor: colors.background , borderTopColor: colors.border}}>
        <Text style={{ fontSize: 15 , margin: 10, color: colors.text }}>
          Drop the pin on your chosen location and wait for the map to zoom out.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={handleConfirm}>
          <Text style={styles.btnText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  pinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -30 }],
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  info: {
    textAlign: "center",
    color: "#374151",
    marginBottom: 8,
  },
  btn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
