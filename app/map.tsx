import React, { useRef, useState } from "react";
import { Dimensions, StyleSheet, View, Text } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import Ionicons from "@expo/vector-icons/Ionicons";
import ZoomButton from "../components/buttons/ZoomButton";
import BackButton from "../components/buttons/BackButton";
import darkMapStyle from "../components/data/darkMapStyle.json";
import rawMarkers from "../components/data/markers.json";
import { Markers, MarkerData, FacultyGradients } from "../types/markerTypes";
import { LinearGradient } from "expo-linear-gradient";

const markers: Markers = rawMarkers as Markers;
type MarkerKey = keyof Markers;

const facultyGradients: FacultyGradients = {
  "Engineering": ["#1c0939", "#002bd7ff"],
  "Arts": ["#d96116ff", "#4a05abff"],
  "Health": ["#042f27ff", "#34ff30ff"],
  "Business": ["#fee140", "#FF1493"],
  "Science": ["#8360c3", "#2ebf91"],
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Map() {
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<Record<string, any>>({});
  const [mapReady, setMapReady] = useState(false);

  const defaultRegion = {
    latitude: 56.162,
    longitude: 10.2039,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const zoomToDefault = () => {
    mapRef.current?.animateToRegion(defaultRegion, 500);
  };

  const handleMarkerPress = (key: MarkerKey) => {
    markerRefs.current[key]?.showCallout();
  };

  const renderMarker = (key: MarkerKey, marker: MarkerData) => (
    <Marker
      key={key}
      coordinate={marker.coordinate}
      onPress={() => handleMarkerPress(key)}
    >
      <Ionicons
        name="beer"
        size={35}
        style={styles.markerIcon}
        color={facultyGradients[marker.faculty][1]}
      />
    <Callout tooltip>
      <LinearGradient
        colors={facultyGradients[marker.faculty]}
        style={styles.callout}
      >
        <Text style={styles.calloutTitle}>{marker.name}</Text>
      </LinearGradient>
  </Callout>
    </Marker>
  );

  return (
    <View style={styles.container}>
      <View style={styles.backButton}>
        <BackButton />
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultRegion}
        customMapStyle={darkMapStyle}
        showsUserLocation
        loadingEnabled
        loadingIndicatorColor="#000"
        rotateEnabled={false}
        onMapReady={() => setMapReady(true)} 
      >
        {Object.entries(markers).map(([key, marker]) =>
          renderMarker(key, marker)
        )}
      </MapView>

      <ZoomButton onPress={zoomToDefault} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { zIndex: 10 },
  map: { flex: 1 },
  callout: {
    marginBottom: 5,    
    borderRadius: 20,
    opacity: 0.8,
    padding: 15,
    minWidth: 150,
    maxWidth: 400,
    alignItems: "center",
    elevation: 5,
  },
  calloutTitle: {
    fontFamily: "Nunito-Bold",
    fontWeight: "500",
    fontSize: 20,
    color: "#fff",
    marginVertical: 3,
    textAlign: "center",
    flexWrap: "wrap",
  },
  markerIcon: {
    opacity: 0.7,
    shadowColor: "#000000ff",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
});


