import React, { useEffect, useState } from "react";
import { AppState } from "react-native";
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

  return <AppNavigator />; // ✅ No UI for step counter here
}
