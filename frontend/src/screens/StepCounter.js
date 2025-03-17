import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Dimensions, ImageBackground } from "react-native";
import { Accelerometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default function StepCounter({ route }) {
  const [steps, setSteps] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState(0);
  const [monthlySteps, setMonthlySteps] = useState(0);
  const [lastZ, setLastZ] = useState(0);
  const animatedSteps = useState(new Animated.Value(0))[0];
  const threshold = 1.5;
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

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
      if (userEmail) await fetchStepsFromDB();
    } catch (error) {
      console.error("Error loading steps:", error);
    }
  };

  const fetchStepsFromDB = async () => {
    try {
      setLoading(true);
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
      if (data) {
        setSteps(data.daily);
        setWeeklySteps(data.weekly);
        setMonthlySteps(data.monthly);
        await AsyncStorage.setItem("steps", data.daily.toString());
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching step history:", error);
      setLoading(false);
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

      await fetchStepsFromDB();
    } catch (error) {
      console.error("Error updating steps:", error);
    }
  };

  const dailyGoal = 10000;
  const progressPercentage = Math.min((steps / dailyGoal) * 100, 100);
  
  return (
    <LinearGradient
      colors={['#1A2151', '#1E1E2C', '#0D0D1A']}
      style={styles.container}
    >
      <Text style={styles.title}>Step Tracker</Text>
      
      <View style={styles.circleContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        
        <View style={styles.mainCircle}>
          <Animated.Text style={styles.stepText}>{steps}</Animated.Text>
          <Text style={styles.stepsLabel}>steps</Text>
          <Text style={styles.goalText}>Goal: {dailyGoal}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{steps}</Text>
          <Text style={styles.statLabel}>TODAY</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{weeklySteps}</Text>
          <Text style={styles.statLabel}>THIS WEEK</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{monthlySteps}</Text>
          <Text style={styles.statLabel}>THIS MONTH</Text>
        </View>
      </View>

      <View style={styles.motivationCard}>
        <Text style={styles.motivationText}>
          {steps < 5000 ? "Keep moving! You're making progress! 🚶" : 
           steps < 10000 ? "Great job! You're halfway to your goal! 🏃" : 
           "Amazing! You've crushed your goal today! 🏆"}
        </Text>
      </View>
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 30,
    letterSpacing: 1,
  },
  circleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBackground: {
    width: width * 0.8,
    height: 8,
    backgroundColor: '#2A2A40',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  mainCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(25, 118, 210, 0.8)',
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#6D9BF1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: '#6D9BF1',
  },
  stepText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  stepsLabel: {
    fontSize: 16,
    color: "#E0E0E0",
    marginTop: -5,
  },
  goalText: {
    fontSize: 14,
    color: "#B0C4DE",
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(30, 30, 50, 0.7)',
    borderRadius: 12,
    padding: 15,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D3D5C',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#9090A0',
    marginTop: 5,
  },
  motivationCard: {
    backgroundColor: 'rgba(40, 40, 60, 0.7)',
    borderRadius: 12,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D3D5C',
  },
  motivationText: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
  },
});