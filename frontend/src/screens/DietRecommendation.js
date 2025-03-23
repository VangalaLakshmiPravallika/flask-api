import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native"; // ✅ Import useNavigation

const DietRecommendation = () => {
  const navigation = useNavigation(); // ✅ Fix: Use navigation hook
  const [bmi, setBmi] = useState(null);
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch BMI
  const fetchBmi = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Login Required", "Please log in first.");
        return;
      }

      const response = await axios.get(
        "https://healthfitnessbackend.onrender.com/api/get-bmi",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBmi(response.data.bmi);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "Failed to fetch BMI");
    }
  };

  // Function to fetch diet plan
  const fetchDietPlan = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Login Required", "Please log in first.");
        return;
      }

      const response = await axios.get(
        "https://healthfitnessbackend.onrender.com/api/recommend-diet",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDietPlan(response.data.recommended_diet);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "Failed to fetch diet plan");
    } finally {
      setLoading(false);
    }
  };

  // Fetch BMI and Diet Plan when the component loads
  useEffect(() => {
    fetchBmi();
    fetchDietPlan();
  }, []);

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.heading}>🥗 Your Personalized Diet Plan</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <>
            {bmi !== null ? <Text style={styles.bmiText}>📊 BMI: {bmi}</Text> : null}

            {dietPlan ? (
              <View style={styles.dietContainer}>
                <Text style={styles.dietText}>📌 Goal: {dietPlan.goal}</Text>
                <Text style={styles.dietText}>🍳 Breakfast: {dietPlan.breakfast}</Text>
                <Text style={styles.dietText}>🥗 Lunch: {dietPlan.lunch}</Text>
                <Text style={styles.dietText}>🍲 Dinner: {dietPlan.dinner}</Text>
                <Text style={styles.dietText}>🍏 Snacks: {dietPlan.snacks}</Text>
              </View>
            ) : (
              <Text style={styles.errorText}>⚠ No diet plan available</Text>
            )}
          </>
        )}

        {/* ✅ Fix: Navigation Back Button */}
        <Button title="🔙 Back to Meal Summary" onPress={() => navigation.goBack()} />
      </View>
    </LinearGradient>
  );
};

// Styling for the component
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  innerContainer: { width: "90%", backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 20, padding: 20, alignItems: "center" },
  heading: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 15, textAlign: "center" },
  bmiText: { fontSize: 20, color: "#fff", marginBottom: 10 },
  dietContainer: { marginTop: 10, alignItems: "center" },
  dietText: { fontSize: 16, color: "#fff", marginBottom: 5 },
  errorText: { fontSize: 16, color: "#ffcc00", marginTop: 10 },
});

export default DietRecommendation;
