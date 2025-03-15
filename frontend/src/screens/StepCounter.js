import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Accelerometer } from "expo-sensors";

export default function StepCounter() {
  const [steps, setSteps] = useState(0);
  const [lastZ, setLastZ] = useState(0);
  const threshold = 1.2; // Adjust for sensitivity

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
      <Text style={styles.title}>Step Counter</Text>
      <Text style={styles.text}>Steps: {steps}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f4f4f4" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  text: { fontSize: 24, fontWeight: "bold", color: "#007bff" },
});
