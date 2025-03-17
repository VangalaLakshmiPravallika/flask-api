import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default function StepHistory() {
  const [dailySteps, setDailySteps] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState(0);
  const [monthlySteps, setMonthlySteps] = useState(0);
  const animatedSteps = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchStepData();
  }, []);

  /** ✅ Fetch Steps from MongoDB & AsyncStorage **/
  const fetchStepData = async () => {
    try {
      const response = await fetch(
        "https://your-backend-url.onrender.com/api/get-step-history",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await response.json();
      setDailySteps(data.daily_steps);
      setWeeklySteps(data.weekly_steps);
      setMonthlySteps(data.monthly_steps);

      // Animate steps smoothly
      Animated.timing(animatedSteps, {
        toValue: data.daily_steps,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } catch (error) {
      console.error("Error fetching step history:", error);
    }
  };

  return (
    <LinearGradient colors={["#141e30", "#243b55"]} style={styles.container}>
      <Text style={styles.title}>📊 Step History</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* 🔹 Daily Steps Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Steps</Text>
          <Animated.Text style={styles.stepCount}>{animatedSteps.interpolate({
            inputRange: [0, dailySteps],
            outputRange: [0, dailySteps],
            extrapolate: "clamp",
          })}</Animated.Text>
          <Text style={styles.subText}>Keep walking! 🚀</Text>
        </View>

        {/* 🔹 Weekly Steps Card */}
        <View style={[styles.card, styles.weeklyCard]}>
          <Text style={styles.cardTitle}>Weekly Steps</Text>
          <Text style={styles.stepCount}>{weeklySteps}</Text>
          <Text style={styles.subText}>You're making progress! 📈</Text>
        </View>

        {/* 🔹 Monthly Steps Card */}
        <View style={[styles.card, styles.monthlyCard]}>
          <Text style={styles.cardTitle}>Monthly Steps</Text>
          <Text style={styles.stepCount}>{monthlySteps}</Text>
          <Text style={styles.subText}>Amazing consistency! 🔥</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  card: {
    width: "85%",
    backgroundColor: "#1f4068",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    marginVertical: 15,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  weeklyCard: {
    backgroundColor: "#663399",
  },
  monthlyCard: {
    backgroundColor: "#cc5500",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  stepCount: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFD700",
  },
  subText: {
    fontSize: 14,
    color: "#AFAFAF",
    marginTop: 5,
  },
});

