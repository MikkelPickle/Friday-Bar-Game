// ZoomButton.tsx
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Get screen width
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Props = {
  onPress: () => void;
};

const ZoomButton: React.FC<Props> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Ionicons name="locate-sharp" size={35} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    marginTop: SCREEN_HEIGHT * 0.88,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF1493', // Blue color for the button
    padding: 13,
    borderRadius: 100,
    marginLeft: SCREEN_WIDTH * 0.75, // Adjust based on button width
    elevation: 5, // Adds shadow for Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 1, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.2, // Shadow opacity for iOS
    shadowRadius: 3, // Shadow blur radius for iOS
  },
  buttonText: {
    color: 'white',
    marginLeft: 10, // Space between icon and text
    fontSize: 16,
  },
});

export default ZoomButton;
