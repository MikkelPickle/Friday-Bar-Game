import React, { useRef, useState } from "react";
import { Dimensions, StyleSheet, View, Text } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import Ionicons from "@expo/vector-icons/Ionicons";
import ZoomButton from "../components/buttons/ZoomButton";
import BackButton from "../components/buttons/BackButton";
import darkMapStyle from "../components/data/darkMapStyle.json";
import rawMarkers from "../components/data/markers.json";
import { Markers, MarkerData, FacultyGradients } from "../components/markerTypes";
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
        name="beer-sharp"
        size={35}
        color={facultyGradients[marker.faculty][1]}
      />
      <Callout tooltip>
  <View style={{ alignItems: "center" }}>
    <LinearGradient
      colors={facultyGradients[marker.faculty]}
      style={styles.callout}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.calloutTitle}>{marker.name}</Text>
    </LinearGradient>

    <View
      style={[
        styles.calloutArrow,
        {
          borderBottomColor:
            (facultyGradients[marker.faculty])[1],
        },
      ]}
    />
  </View>
</Callout>
    </Marker>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
  header: { position: "absolute", top: SCREEN_HEIGHT * 0.04, left: SCREEN_WIDTH * 0.04, zIndex: 10 },
  map: { flex: 1 },

  callout: {
  borderRadius: 16,
  alignSelf: "center",
  padding: 14,
  minWidth: 170,
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.3,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 5,
},

calloutTitle: {
  fontWeight: "bold",
  fontSize: 17,
  color: "#fff",
  marginBottom: 6,
  textAlign: "center",
},

calloutDescription: {
  fontSize: 14,
  color: "#f0f0f0",
  textAlign: "center",
},

calloutArrow: {
  width: 0,
  height: 0,
  borderLeftWidth: 10,
  borderRightWidth: 10,
  borderBottomWidth: 12,
  borderLeftColor: "transparent",
  borderRightColor: "transparent",
},
});


