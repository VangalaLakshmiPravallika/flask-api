import React, { useEffect, useState } from "react";
import { AppState, View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppNavigator from "./AppNavigator";
import { Accelerometer } from "expo-sensors";

export default function App() {
  const [steps, setSteps] = useState(0);
  const [lastZ, setLastZ] = useState(0);
  const [threshold, setThreshold] = useState(1.2); // Adjust sensitivity

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === "active") {
        await AsyncStorage.setItem("lastActiveTime", Date.now().toString());
      }
    };

    AppState.addEventListener("change", handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    let subscription = Accelerometer.addListener(({ x, y, z }) => {
      let deltaZ = Math.abs(z - lastZ);
      if (deltaZ > threshold) {
        setSteps((prevSteps) => prevSteps + 1);
      }
      setLastZ(z);
    });

    return () => subscription.remove();
  }, [lastZ]);

  return (
    <View style={styles.container}>
      <AppNavigator />
      <View style={styles.stepContainer}>
        <Text style={styles.stepText}>Steps: {steps}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stepContainer: {
    position: "absolute",
    bottom: 30,
    left: "50%",
    transform: [{ translateX: -50 }],
    backgroundColor: "black",
    padding: 10,
    borderRadius: 10,
  },
  stepText: { fontSize: 20, color: "white", fontWeight: "bold" },
});
