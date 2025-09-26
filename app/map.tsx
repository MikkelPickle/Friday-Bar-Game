import React, { useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE , Callout} from "react-native-maps";
import Ionicons from "@expo/vector-icons/Ionicons";
import ZoomButton from "../components/buttons/ZoomButton";
import BackButton from "../components/buttons/BackButton";
import { useRouter } from "expo-router";
import darkMapStyle from "../components/styles/darkMapStyle.json";
import markers from "../components/data/markers.json";

type MarkerKey = "food" | "entrance" | "intensive";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Map() {
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const [displayedMarker, setDisplayedMarker] = useState<MarkerKey | null>(null);

  const defaultRegion = {
    latitude: 56.162,
    longitude: 10.2039,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const zoomToDefault = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(defaultRegion, 500); // 500ms animation
    }
  };

  const handleMarkerPress = (markerId: string) => {
    router.push({
      pathname: "/details",
      params: { id: markerId },
    });
  };

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
        showsUserLocation={true}
        followsUserLocation={true}
        loadingEnabled={true}
        loadingIndicatorColor="#000"
        rotateEnabled={false}
      >
        {Object.entries(markers).map(([key, marker]) => (
          <Marker
            key={key}
            coordinate={marker.coordinate}
            title={marker.name}
            description={marker.description}
            onPress={() => handleMarkerPress(key)}>
            <Ionicons name={"beer-sharp"} size={35} color={marker.faculty === "Science" ? "blue" : "green"} />
            </Marker>
          ))}
      </MapView>

      <ZoomButton onPress={zoomToDefault} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
  },
  header: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.04,
    left: SCREEN_WIDTH * 0.04,
    zIndex: 10,
  },
  map: {
    flex: 1,
  },
});
