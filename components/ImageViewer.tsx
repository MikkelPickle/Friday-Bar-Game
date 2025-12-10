import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Image } from "expo-image";

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
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#e62bd3ff',
    overflow: 'hidden',
  },
  imageWrapper: {
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#f0ff1cff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10, // for Android
  },
  });

export default ImageViewer;