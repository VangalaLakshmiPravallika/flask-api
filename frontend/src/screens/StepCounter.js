import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Accelerometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function StepCounter() {
  const [steps, setSteps] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState(0);
  const [monthlySteps, setMonthlySteps] = useState(0);
  const [lastAcceleration, setLastAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const animatedSteps = useState(new Animated.Value(0))[0];
  const threshold = 0.8; 
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) setUserEmail(email);
    };
    fetchUserEmail();
    loadSteps();
    fetchStepHistory();
  }, []);

  useEffect(() => {
    Accelerometer.setUpdateInterval(50); 

    let subscription = Accelerometer.addListener(({ x, y, z }) => {
      let delta = Math.sqrt(
        (x - lastAcceleration.x) ** 2 +
        (y - lastAcceleration.y) ** 2 +
        (z - lastAcceleration.z) ** 2
      );

      if (delta > threshold) {
        updateSteps(steps + 1);
        Animated.timing(animatedSteps, {
          toValue: steps + 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }

      setLastAcceleration({ x, y, z });
    });

    return () => subscription.remove();
  }, [lastAcceleration, steps]);


  const loadSteps = async () => {
    try {
      const storedSteps = await AsyncStorage.getItem("steps");
      if (storedSteps !== null) {
        setSteps(parseInt(storedSteps, 10));
        animatedSteps.setValue(parseInt(storedSteps, 10));
      }
      if (userEmail) fetchStepHistory();
    } catch (error) {
      console.error("Error loading steps:", error);
    }
  };


  const fetchStepHistory = async () => {
    try {
      const response = await fetch(
        "https://healthfitnessbackend.onrender.com/api/get-step-history",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await response.json();
      setSteps(data.daily || 0);
      setWeeklySteps(data.weekly || 0);
      setMonthlySteps(data.monthly || 0);
      await AsyncStorage.setItem("steps", data.daily.toString());
    } catch (error) {
      console.error("Error fetching step history:", error);
    }
  };


  const updateSteps = async (newSteps) => {
    setSteps(newSteps);
    await AsyncStorage.setItem("steps", newSteps.toString());

    try {
      await fetch("https://healthfitnessbackend.onrender.com/api/update-steps", {
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
        <Animated.Text style={styles.stepText}>{steps}</Animated.Text>
      </View>

      <Text style={styles.subtitle}>Daily: {steps} steps</Text>
      <Text style={styles.subtitle}>Weekly: {weeklySteps} steps</Text>
      <Text style={styles.subtitle}>Monthly: {monthlySteps} steps</Text>

      <Text style={styles.footer}>Keep moving and stay active! 🚀</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1E1E2C", padding: 20 },
  title: { fontSize: 30, fontWeight: "bold", color: "#FFD700", marginBottom: 20, textTransform: "uppercase" },
  subtitle: { fontSize: 18, color: "#AFAFAF", marginTop: 10 },
  circle: { width: 150, height: 150, borderRadius: 75, backgroundColor: "#007bff", justifyContent: "center", alignItems: "center", elevation: 10, shadowColor: "#fff", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 8 },
  stepText: { fontSize: 36, fontWeight: "bold", color: "#fff" },
  footer: { marginTop: 20, color: "#FFD700" },
});
