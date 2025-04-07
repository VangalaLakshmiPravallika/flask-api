import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const WeeklyMealPlan = ({ navigation }) => {
  const [bmi, setBmi] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyCalories, setDailyCalories] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Login Required", "Please log in first.");
        navigation.navigate("Home");
        return;
      }

      // Fetch BMI
      const bmiResponse = await axios.get(
        "https://healthfitnessbackend.onrender.com/api/get-bmi",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBmi(bmiResponse.data.bmi);

      const mealPlanResponse = await axios.get(
        "https://healthfitnessbackend.onrender.com/api/meal-plan",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMealPlan(mealPlanResponse.data);
      
      if (mealPlanResponse.data) {
        const firstDay = mealPlanResponse.data['Day 1'];
        if (firstDay) {
          setDailyCalories(firstDay.total_calories);
        }
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const renderMeal = (meal) => {
    return (
      <View style={styles.mealContainer}>
        <Text style={styles.mealHeader}>
          🍽️ Total: {meal.total_calories.toFixed(0)} kcal | 
          P: {meal.total_protein.toFixed(1)}g | 
          C: {meal.total_carbs.toFixed(1)}g | 
          F: {meal.total_fat.toFixed(1)}g
        </Text>
        {meal.foods.map((food, index) => (
          <Text key={index} style={styles.foodItem}>
            • {food.name} ({food.calories.toFixed(0)} kcal)
          </Text>
        ))}
      </View>
    );
  };

  const renderDay = (day, dayData) => {
    return (
      <View key={day} style={styles.dayContainer}>
        <Text style={styles.dayHeader}>{day}</Text>
        <Text style={styles.mealType}>🌅 Breakfast</Text>
        {renderMeal(dayData.breakfast)}
        
        <Text style={styles.mealType}>☀️ Lunch</Text>
        {renderMeal(dayData.lunch)}
        
        <Text style={styles.mealType}>🌙 Dinner</Text>
        {renderMeal(dayData.dinner)}
        
        <Text style={styles.mealType}>🍎 Snacks</Text>
        {dayData.snacks.map((snack, index) => (
          <View key={index}>
            {renderMeal(snack)}
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.heading}>🍏 Weekly Meal Plan</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#ffffff" />
          ) : (
            <>
              {bmi && (
                <Text style={styles.infoText}>
                  📊 Your BMI: {bmi.toFixed(1)} | 
                  🎯 Daily Calories: {dailyCalories ? dailyCalories.toFixed(0) : 'N/A'} kcal
                </Text>
              )}

              {mealPlan ? (
                Object.entries(mealPlan).map(([day, dayData]) => renderDay(day, dayData))
              ) : (
                <Text style={styles.errorText}>⚠ No meal plan available. Please complete your profile.</Text>
              )}
            </>
          )}

          <Button 
            title="🔙 Back to Dashboard" 
            onPress={() => navigation.goBack()} 
            color="#fff"
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  innerContainer: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  dayContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  dayHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  mealType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginTop: 10,
    marginBottom: 5,
  },
  mealContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  mealHeader: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 5,
  },
  foodItem: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 10,
    marginBottom: 3,
  },
  errorText: {
    fontSize: 16,
    color: "#ffcc00",
    textAlign: "center",
    marginVertical: 20,
  },
});

export default WeeklyMealPlan;