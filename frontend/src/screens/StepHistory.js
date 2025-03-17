import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity, 
  ScrollView, 
  Animated 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function StepHistory({ navigation }) {
  const [stepData, setStepData] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [loading, setLoading] = useState(true);
  const animatedOpacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchStepHistory();
  }, []);

  const fetchStepHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("User not authenticated");

      const response = await fetch("https://healthfitnessbackend.onrender.com/api/get-step-history", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });

      const responseText = await response.text();  // Read raw response
      if (!response.ok) throw new Error(`Server error: ${responseText}`);

      const data = JSON.parse(responseText);
      setStepData({
        daily: data.daily || 0,
        weekly: data.weekly || 0,
        monthly: data.monthly || 0
      });

      // Smooth animation on load
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

    } catch (error) {
      Alert.alert("Error", error.message);
      console.error("Error fetching step history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Step History</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" />
      ) : (
        <Animated.View style={[styles.historyContainer, { opacity: animatedOpacity }]}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            
            {/* Daily Steps Card */}
            <View style={styles.card}>
              <Ionicons name="walk" size={50} color="#fff" />
              <Text style={styles.cardTitle}>Today</Text>
              <Text style={styles.cardSteps}>{stepData.daily} Steps</Text>
            </View>

            {/* Weekly Steps Card */}
            <View style={styles.card}>
              <Ionicons name="calendar-outline" size={50} color="#fff" />
              <Text style={styles.cardTitle}>This Week</Text>
              <Text style={styles.cardSteps}>{stepData.weekly} Steps</Text>
            </View>

            {/* Monthly Steps Card */}
            <View style={styles.card}>
              <Ionicons name="calendar" size={50} color="#fff" />
              <Text style={styles.cardTitle}>This Month</Text>
              <Text style={styles.cardSteps}>{stepData.monthly} Steps</Text>
            </View>

          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

// ✅ Stylish UI with shadows and gradient
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2C",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 20,
  },
  historyContainer: {
    width: "100%",
    alignItems: "center",
  },
  scrollView: {
    alignItems: "center",
    width: "100%",
  },
  card: {
    width: "90%",
    backgroundColor: "#007bff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 10,
  },
  cardSteps: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFD700",
  },
});

