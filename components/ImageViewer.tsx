import { TouchableOpacity, StyleSheet, View, Dimensions } from "react-native";
import { Image } from "expo-image"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ImageViewer = ({ img, changeImage }) => {
    return (
        <View style={styles.imageWrapper}>
        <TouchableOpacity onPress={changeImage}>
          <Image
            key={img}
            source={img ? { uri: img } : require("../assets/default-profile.jpg")}
            style={styles.profileImage}
            />
        </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    profileImage: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
    borderRadius: (SCREEN_WIDTH * 0.4) / 2,
    borderWidth: 2,
    borderColor: '#e62bd3ff',
    overflow: 'hidden',
  },
  imageWrapper: {
    marginTop: SCREEN_HEIGHT * 0.03,
    marginBottom: SCREEN_HEIGHT * 0.05,
    shadowColor: '#f0ff1cff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10, // for Android
  },
  });

export default ImageViewer;