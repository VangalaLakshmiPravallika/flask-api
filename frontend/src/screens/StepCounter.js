import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Accelerometer } from "expo-sensors";

export default function StepCounter() {
  const [steps, setSteps] = useState(0);
  const [lastZ, setLastZ] = useState(0);
  const animatedSteps = useState(new Animated.Value(0))[0];
  const threshold = 1.2; // Adjust for sensitivity

  useEffect(() => {
    let subscription = Accelerometer.addListener(({ x, y, z }) => {
      let deltaZ = Math.abs(z - lastZ);
      if (deltaZ > threshold) {
        setSteps((prevSteps) => prevSteps + 1);
        Animated.timing(animatedSteps, {
          toValue: steps + 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
      setLastZ(z);
    });

    return () => subscription.remove();
  }, [lastZ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step Counter</Text>
      
      <View style={styles.circle}>
        <Animated.Text style={styles.stepText}>{animatedSteps.interpolate({
          inputRange: [0, steps],
          outputRange: [0, steps],
          extrapolate: "clamp"
        })}</Animated.Text>
      </View>

      <Text style={styles.subtitle}>Keep moving and stay active! 🚀</Text>
    </View>
  );
}

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
