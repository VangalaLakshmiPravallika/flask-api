import React, { useEffect, useState } from "react";
import { 
  View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, 
  ScrollView, Dimensions, SafeAreaView, ImageBackground 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart, BarChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");

const SleepTracker = () => {
  const [sleepDetected, setSleepDetected] = useState(false);
  const [sleepHours, setSleepHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sleepHistory, setSleepHistory] = useState([]);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [sleepRating, setSleepRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [sleepStreakDays, setSleepStreakDays] = useState(0);
  const navigation = useNavigation();
  const animation = React.useRef(null);

  useEffect(() => {
    checkSleep();
    fetchSleepHistory();
    calculateSleepStreak();
    
    if (animation.current) {
      animation.current.play();
    }
  }, []);

  const fetchSleepHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get(
        "https://healthfitnessbackend.onrender.com/api/sleep-history",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.history) {
        setSleepHistory(response.data.history.slice(-7)); // Last 7 days
        
        // Calculate sleep quality based on recent history
        const avgSleep = response.data.history.slice(-3).reduce((sum, entry) => 
          sum + parseFloat(entry.sleep_hours), 0) / 3;
        setSleepQuality(avgSleep >= 7 ? 85 : avgSleep >= 6 ? 70 : 55);
      }
    } catch (error) {
      console.error("Error fetching sleep history:", error);
    }
  };

  const calculateSleepStreak = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get(
        "https://healthfitnessbackend.onrender.com/api/sleep-streak",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.streak) {
        setSleepStreakDays(response.data.streak);
      }
    } catch (error) {
      console.error("Error calculating sleep streak:", error);
    }
  };

  const checkSleep = async () => {
    try {
      const lastActive = await AsyncStorage.getItem("lastActiveTime");
      if (!lastActive) {
        setLoading(false);
        return;
      }

      const lastActiveTime = new Date(parseInt(lastActive));
      const currentTime = new Date();
      const inactiveDuration = (currentTime - lastActiveTime) / 1000 / 60 / 60;

      if (inactiveDuration >= 5) {
        setSleepHours(inactiveDuration.toFixed(2));
        setSleepDetected(true);
      }
    } catch (error) {
      console.error("Error detecting sleep:", error);
    } finally {
      setLoading(false);
    }
  };

  const logSleepToBackend = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Login Required", "Please log in.");
        return;
      }

      if (!sleepDetected) {
        Alert.alert("No Sleep Data", "No sleep detected from inactivity.");
        return;
      }

      setShowRatingModal(true);
    } catch (error) {
      console.error("Error logging sleep:", error);
      Alert.alert("Error", "Failed to log sleep data.");
    }
  };

  const submitSleepData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.post(
        "https://healthfitnessbackend.onrender.com/api/log-sleep",
        {
          date: new Date().toISOString().split("T")[0],
          sleep_hours: sleepHours,
          sleep_rating: sleepRating
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowRatingModal(false);
      
      // Update local data
      fetchSleepHistory();
      calculateSleepStreak();
      
      Alert.alert("Success", response.data.message);
    } catch (error) {
      console.error("Error submitting sleep data:", error);
      Alert.alert("Error", "Failed to log sleep data.");
    }
  };

  const renderSleepQualityIndicator = () => {
    let color = "#FF5722";
    let icon = "moon-waning-crescent";
    let text = "Poor";
    
    if (sleepQuality >= 80) {
      color = "#4CAF50";
      icon = "moon";
      text = "Excellent";
    } else if (sleepQuality >= 60) {
      color = "#FFC107";
      icon = "moon-waxing-crescent";
      text = "Good";
    }
    
    return (
      <View style={styles.qualityCard}>
        <Text style={styles.qualityTitle}>Sleep Quality</Text>
        <View style={styles.qualityIndicator}>
          <MaterialCommunityIcons name={icon} size={40} color={color} />
          <View style={styles.qualityTextContainer}>
            <Text style={[styles.qualityText, { color }]}>{text}</Text>
            <Text style={styles.qualityPercent}>{sleepQuality}%</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSleepRatingModal = () => {
    if (!showRatingModal) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>How did you sleep?</Text>
          
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity 
                key={rating}
                onPress={() => setSleepRating(rating)}
                style={styles.ratingButton}
              >
                <Ionicons 
                  name={rating <= sleepRating ? "star" : "star-outline"} 
                  size={32} 
                  color={rating <= sleepRating ? "#FFD700" : "#ccc"}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowRatingModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.submitButton]}
              onPress={submitSleepData}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderSleepChart = () => {
    if (sleepHistory.length === 0) {
      return (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>No sleep data yet</Text>
        </View>
      );
    }

    const chartData = {
      labels: sleepHistory.map(entry => {
        const date = new Date(entry.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [
        {
          data: sleepHistory.map(entry => parseFloat(entry.sleep_hours)),
          color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ["Sleep Hours"]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sleep Pattern</Text>
        <LineChart
          data={chartData}
          width={width - 40}
          height={180}
          chartConfig={{
            backgroundColor: "#1e2923",
            backgroundGradientFrom: "#272643",
            backgroundGradientTo: "#3a4a8c",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726"
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderSleepDistributionChart = () => {
    if (sleepHistory.length === 0) return null;
    
    // Generate distribution data
    const sleepCategories = [
      { label: "<6h", count: 0 },
      { label: "6-7h", count: 0 },
      { label: "7-8h", count: 0 },
      { label: ">8h", count: 0 }
    ];
    
    sleepHistory.forEach(entry => {
      const hours = parseFloat(entry.sleep_hours);
      if (hours < 6) sleepCategories[0].count++;
      else if (hours < 7) sleepCategories[1].count++;
      else if (hours < 8) sleepCategories[2].count++;
      else sleepCategories[3].count++;
    });
    
    const chartData = {
      labels: sleepCategories.map(cat => cat.label),
      datasets: [
        {
          data: sleepCategories.map(cat => cat.count),
          colors: [
            (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
            (opacity = 1) => `rgba(255, 159, 64, ${opacity})`,
            (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
            (opacity = 1) => `rgba(54, 162, 235, ${opacity})`
          ]
        }
      ]
    };
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sleep Distribution</Text>
        <BarChart
          data={chartData}
          width={width - 40}
          height={180}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: "#1e2923",
            backgroundGradientFrom: "#3a4a8c",
            backgroundGradientTo: "#272643",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16
            },
            barPercentage: 0.7
          }}
          style={styles.chart}
          fromZero
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/night-sky.jpg")}
        style={styles.backgroundImage}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>🌙 Dream Tracker</Text>
            <Text style={styles.subHeader}>Advanced Sleep Analytics</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <LottieView
                ref={animation}
                source={require("../assets/sleep-loading.json")}
                style={styles.loadingAnimation}
                autoPlay
                loop
              />
              <Text style={styles.loadingText}>Analyzing your sleep pattern...</Text>
            </View>
          ) : (
            <>
              <LinearGradient
                colors={["#2c3e50", "#3498db"]}
                style={styles.sleepInfoCard}
              >
                <View style={styles.sleepInfoContent}>
                  {sleepDetected ? (
                    <>
                      <View style={styles.sleepInfoHeader}>
                        <MaterialCommunityIcons name="sleep" size={40} color="#FFF" />
                        <Text style={styles.sleepDetectedText}>Sleep Detected</Text>
                      </View>
                      <Text style={styles.sleepHoursText}>{sleepHours}h</Text>
                      <Text style={styles.recommendationText}>
                        {sleepHours < 7 
                          ? "You should aim for 7-9 hours of sleep" 
                          : "Great job! You're in the optimal range"}
                      </Text>
                    </>
                  ) : (
                    <>
                      <View style={styles.sleepInfoHeader}>
                        <MaterialCommunityIcons name="sleep-off" size={40} color="#FFF" />
                        <Text style={styles.noSleepText}>No Sleep Detected</Text>
                      </View>
                      <Text style={styles.recommendationText}>
                        We'll track your sleep automatically when you're inactive for 5+ hours
                      </Text>
                    </>
                  )}
                </View>
              </LinearGradient>

              <View style={styles.streakContainer}>
                <View style={styles.streakCard}>
                  <FontAwesome5 name="fire" size={24} color="#FF5722" />
                  <Text style={styles.streakText}>{sleepStreakDays} Day Streak</Text>
                </View>
              </View>

              {renderSleepQualityIndicator()}
              {renderSleepChart()}
              {renderSleepDistributionChart()}

              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Sleep Tips</Text>
                <View style={styles.tipCard}>
                  <Ionicons name="time-outline" size={24} color="#3F51B5" />
                  <Text style={styles.tipText}>Maintain a consistent sleep schedule</Text>
                </View>
                <View style={styles.tipCard}>
                  <Ionicons name="phone-portrait-outline" size={24} color="#3F51B5" />
                  <Text style={styles.tipText}>Avoid screens 1 hour before bedtime</Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.logButton} onPress={logSleepToBackend}>
                  <LinearGradient
                    colors={["#4CAF50", "#2E7D32"]}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
                    <Text style={styles.buttonText}>Log Sleep</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.yogaButton} 
                  onPress={() => navigation.navigate("SoothingMusic")}
                >
                  <LinearGradient
                    colors={["#3F51B5", "#1A237E"]}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="musical-notes-outline" size={22} color="#fff" />
                    <Text style={styles.buttonText}>YogaNidra for Better Sleep</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </ImageBackground>
      {renderSleepRatingModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subHeader: {
    fontSize: 16,
    color: "#E0E0E0",
    marginTop: 5,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    color: "#FFF",
    fontSize: 16,
    marginTop: 10,
  },
  sleepInfoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
  },
  sleepInfoContent: {
    alignItems: "center",
  },
  sleepInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sleepDetectedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: 10,
  },
  sleepHoursText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFF",
    marginVertical: 10,
  },
  noSleepText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: "#E0E0E0",
    textAlign: "center",
  },
  streakContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  streakCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: "center",
  },
  streakText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: 8,
  },
  qualityCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },
  qualityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  qualityIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  qualityTextContainer: {
    marginLeft: 15,
  },
  qualityText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  qualityPercent: {
    fontSize: 16,
    color: "#E0E0E0",
  },
  chartContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  chart: {
    borderRadius: 16,
  },
  chartPlaceholder: {
    height: 180,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  chartPlaceholderText: {
    color: "#FFF",
    fontSize: 16,
  },
  tipsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: "#FFF",
    marginLeft: 10,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 10,
  },
  logButton: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  yogaButton: {
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  ratingButton: {
    padding: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default SleepTracker;