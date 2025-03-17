import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Accelerometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function StepCounter() {
  const [steps, setSteps] = useState(0);
  const [lastZ, setLastZ] = useState(0);
  const animatedSteps = useState(new Animated.Value(0))[0];
  const threshold = 1.2;
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) setUserEmail(email);
    };
    fetchUserEmail();
    loadSteps();
  }, []);

  useEffect(() => {
    let subscription = Accelerometer.addListener(({ x, y, z }) => {
      let deltaZ = Math.abs(z - lastZ);
      if (deltaZ > threshold) {
        updateSteps(steps + 1);
        Animated.timing(animatedSteps, {
          toValue: steps + 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
      setLastZ(z);
    });

    return () => subscription.remove();
  }, [lastZ, steps]);

  const loadSteps = async () => {
    try {
      const storedSteps = await AsyncStorage.getItem("steps");
      if (storedSteps !== null) {
        setSteps(parseInt(storedSteps, 10));
        animatedSteps.setValue(parseInt(storedSteps, 10));
      }
      if (userEmail) fetchStepsFromDB(userEmail);
    } catch (error) {
      console.error("Error loading steps:", error);
    }
  };

  const fetchStepsFromDB = async (email) => {
    try {
      const response = await fetch(
        `https://your-backend-url.onrender.com/api/get-steps`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await response.json();
      if (data.steps !== undefined) {
        setSteps(data.steps);
        animatedSteps.setValue(data.steps);
        await AsyncStorage.setItem("steps", data.steps.toString());
      }
    } catch (error) {
      console.error("Error fetching steps:", error);
    }
  };

  const updateSteps = async (newSteps) => {
    setSteps(newSteps);
    await AsyncStorage.setItem("steps", newSteps.toString());

    try {
      await fetch("https://your-backend-url.onrender.com/api/update-steps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ steps: newSteps }),
      });
    } catch (error) {
      console.error("Error updating steps:", error);
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
            extrapolate: "clamp",
          })}
        </Animated.Text>
      </View>

      <Text style={styles.subtitle}>Keep moving and stay active! 🚀</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1E1E2C", padding: 20 },
  title: { fontSize: 30, fontWeight: "bold", color: "#FFD700", marginBottom: 20, textTransform: "uppercase" },
  subtitle: { fontSize: 18, color: "#AFAFAF", marginTop: 20 },
  circle: { width: 150, height: 150, borderRadius: 75, backgroundColor: "#007bff", justifyContent: "center", alignItems: "center", elevation: 10, shadowColor: "#fff", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 8 },
  stepText: { fontSize: 36, fontWeight: "bold", color: "#fff" },
});
