import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Accelerometer } from "expo-sensors";

export default function StepCounter() {
  const [steps, setSteps] = useState(0);
  const [lastZ, setLastZ] = useState(0);
  const [threshold, setThreshold] = useState(1.2);

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
      <Text style={styles.text}>Steps: {steps}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24, fontWeight: "bold" },
});
