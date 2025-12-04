import React from "react";
import { View, Button } from "react-native";
import { useGoogleAuth } from "../helpers/googleAuth";

export default function LoginScreen() {
  const { promptAsync, request } = useGoogleAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button
        title="Sign in with Google"
        onPress={() => promptAsync()}
        disabled={!request}
      />
    </View>
  );
}

