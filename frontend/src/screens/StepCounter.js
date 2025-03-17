import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Alert } from "react-native";
import { Accelerometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function StepCounter() {
  const [steps, setSteps] = useState(0);
  const [lastZ, setLastZ] = useState(0);
  const animatedSteps = useState(new Animated.Value(0))[0];
  const threshold = 1.2; // Sensitivity for step detection

  useEffect(() => {
    // Load saved steps from AsyncStorage
    const loadSteps = async () => {
      const savedSteps = await AsyncStorage.getItem("stepCount");
      if (savedSteps) {
        setSteps(parseInt(savedSteps));
      }
    };
    loadSteps();

    let subscription = Accelerometer.addListener(({ x, y, z }) => {
      let deltaZ = Math.abs(z - lastZ);
      if (deltaZ > threshold) {
        const newStepCount = steps + 1;
        setSteps(newStepCount);
        AsyncStorage.setItem("stepCount", newStepCount.toString());

        Animated.timing(animatedSteps, {
          toValue: newStepCount,
          duration: 300,
          useNativeDriver: false,
        }).start();

        if (newStepCount % 10 === 0) {
          sendStepsToBackend(newStepCount);
        }
      }
      setLastZ(z);
    });

    return () => subscription.remove();
  }, [steps, lastZ]);

  // ✅ Send steps to MongoDB Atlas via Backend API
  const sendStepsToBackend = async (newStepCount) => {
    try {
      const response = await fetch("https://healthfitnessbackend.onrender.com/api/log-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: newStepCount, timestamp: new Date().toISOString() }),
      });

      const data = await response.json();
      console.log("🔹 Steps Synced:", data);
    } catch (error) {
      console.error("⚠️ Failed to sync steps:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step Counter</Text>
      
      <View style={styles.circle}>
        <Animated.Text style={styles.stepText}>
          {animatedSteps.interpolate({
            inputRange: [0, steps],
            outputRange: [0, steps],
            extrapolate: "clamp"
          })}
        </Animated.Text>
      </View>

      <Text style={styles.subtitle}>Keep moving and stay active! 🚀</Text>
    </View>
  );
}

// ✅ Enhanced UI Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E2C", 
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFD700", 
    marginBottom: 20,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 18,
    color: "#AFAFAF",
    marginTop: 20,
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#007bff", 
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  stepText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
});

