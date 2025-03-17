import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function StepHistory() {
  const [stepData, setStepData] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStepHistory();
  }, []);

  const fetchStepHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch("https://your-backend-url.onrender.com/api/get-step-history", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setStepData(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load step history.");
      console.error("Error fetching step history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading step history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step History</Text>

      <View style={styles.stepBox}>
        <Text style={styles.stepLabel}>Today:</Text>
        <Text style={styles.stepCount}>{stepData.daily} steps</Text>
      </View>

      <View style={styles.stepBox}>
        <Text style={styles.stepLabel}>This Week:</Text>
        <Text style={styles.stepCount}>{stepData.weekly} steps</Text>
      </View>

      <View style={styles.stepBox}>
        <Text style={styles.stepLabel}>This Month:</Text>
        <Text style={styles.stepCount}>{stepData.monthly} steps</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f4f4f4", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#333" },
  stepBox: { width: "90%", padding: 20, backgroundColor: "#007bff", borderRadius: 10, marginBottom: 15, alignItems: "center" },
  stepLabel: { fontSize: 18, color: "#fff", fontWeight: "bold" },
  stepCount: { fontSize: 22, color: "#fff", fontWeight: "bold", marginTop: 5 },
  loadingText: { fontSize: 18, color: "#333", marginTop: 10 },
});
