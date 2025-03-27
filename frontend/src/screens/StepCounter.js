import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView,
  AppState
} from "react-native";
import { Accelerometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Progress from 'react-native-progress';
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

export default function StepCounter({ navigation }) {
  // State management
  const [steps, setSteps] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState(0);
  const [monthlySteps, setMonthlySteps] = useState(0);
  const [lastZ, setLastZ] = useState(0);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stepHistory, setStepHistory] = useState([]);
  const [apiError, setApiError] = useState(false);
  
  // Animations
  const animatedSteps = useState(new Animated.Value(0))[0];
  const animatedOpacity = useState(new Animated.Value(0))[0];
  const scaleValue = useState(new Animated.Value(1))[0];
  
  // Constants
  const threshold = 1.5;
  const dailyGoal = 10000;
  const progressPercentage = Math.min((steps / dailyGoal) * 100, 100);

  // Prepare chart data with fallbacks
  const weeklyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: stepHistory.length > 0 
          ? stepHistory.map(item => item.steps) 
          : [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };
  
  const monthlyData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        data: [
          Math.round(weeklySteps * 0.8) || 0,
          Math.round(weeklySteps * 1.1) || 0,
          Math.round(weeklySteps * 0.9) || 0,
          Math.round(weeklySteps * 1.2) || 0
        ],
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };
  
  const pieData = [
    {
      name: "Completed",
      steps: steps,
      color: "#4CAF50",
      legendFontColor: "#FFFFFF",
      legendFontSize: 15
    },
    {
      name: "Remaining",
      steps: Math.max(0, dailyGoal - steps),
      color: "#F44336",
      legendFontColor: "#FFFFFF",
      legendFontSize: 15
    }
  ];

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        if (email) setUserEmail(email);
        
        await loadSteps();
        
        // Animation on mount
        Animated.sequence([
          Animated.timing(animatedOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(scaleValue, {
            toValue: 1.05,
            friction: 3,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error) {
        console.error("Initialization error:", error);
        setLoading(false);
        setApiError(true);
      }
    };
    
    initializeApp();

    return () => {
      // Clean up accelerometer listener
      Accelerometer.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    let subscription;
    
    if (!loading) {
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        let deltaZ = Math.abs(z - lastZ);
        if (deltaZ > threshold) {
          updateSteps(steps + 1);
          
          // Pulse animation when step is detected
          Animated.sequence([
            Animated.timing(scaleValue, {
              toValue: 1.1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
          
          Animated.timing(animatedSteps, {
            toValue: steps + 1,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }
        setLastZ(z);
      });
    }

    return () => {
      if (subscription) subscription.remove();
    };
  }, [lastZ, steps, loading]);

  const loadSteps = async () => {
    try {
      setLoading(true);
      const storedSteps = await AsyncStorage.getItem("steps");
      if (storedSteps !== null) {
        setSteps(parseInt(storedSteps, 10));
        animatedSteps.setValue(parseInt(storedSteps, 10));
      }
      
      if (userEmail) {
        await fetchStepsFromDB();
      } else {
        // If no user email, use local storage only
        setWeeklySteps(steps * 7);
        setMonthlySteps(steps * 30);
        setStepHistory(generateFallbackHistory(steps));
      }
    } catch (error) {
      console.error("Error loading steps:", error);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackHistory = (currentSteps) => {
    return [
      { day: "Monday", steps: currentSteps || 0 },
      { day: "Tuesday", steps: Math.round((currentSteps || 0) * 1.2) },
      { day: "Wednesday", steps: Math.round((currentSteps || 0) * 0.8) },
      { day: "Thursday", steps: Math.round((currentSteps || 0) * 1.1) },
      { day: "Friday", steps: Math.round((currentSteps || 0) * 0.9) },
      { day: "Saturday", steps: Math.round((currentSteps || 0) * 1.3) },
      { day: "Sunday", steps: Math.round((currentSteps || 0) * 0.7) },
    ];
  };

  const fetchStepsFromDB = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(
        "https://healthfitnessbackend.onrender.com/api/get-step-history",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data) {
        setSteps(data.daily || 0);
        setWeeklySteps(data.weekly || 0);
        setMonthlySteps(data.monthly || 0);
        await AsyncStorage.setItem("steps", (data.daily || 0).toString());
        
        if (data.history && Array.isArray(data.history)) {
          setStepHistory(data.history);
        } else {
          setStepHistory(generateFallbackHistory(data.daily || 0));
        }
      }
    } catch (error) {
      console.error("Error fetching step history:", error);
      setApiError(true);
      // Use fallback data when API fails
      const storedSteps = await AsyncStorage.getItem("steps");
      const currentSteps = storedSteps ? parseInt(storedSteps, 10) : 0;
      setStepHistory(generateFallbackHistory(currentSteps));
      setWeeklySteps(currentSteps * 7);
      setMonthlySteps(currentSteps * 30);
    }
  };

  const updateSteps = async (newSteps) => {
    try {
      setSteps(newSteps);
      await AsyncStorage.setItem("steps", newSteps.toString());

      const response = await fetch("https://healthfitnessbackend.onrender.com/api/update-steps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ steps: newSteps }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchStepsFromDB();
    } catch (error) {
      console.error("Error updating steps:", error);
      // Continue with local storage even if API fails
    }
  };

  const renderDashboard = () => (
    <ScrollView 
      contentContainerStyle={styles.dashboardScrollView}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.contentContainer, { opacity: animatedOpacity }]}>
        <Text style={styles.title}>Step Tracker</Text>
        
        <Animated.View style={[styles.circleContainer, { transform: [{ scale: scaleValue }] }]}>
          <Progress.Bar 
            progress={progressPercentage / 100} 
            width={Dimensions.get('window').width * 0.8}
            height={10}
            color="#4CAF50"
            unfilledColor="#2A2A40"
            borderWidth={0}
            borderRadius={5}
            animated={true}
          />
          
          <View style={styles.mainCircle}>
            <Animated.Text style={styles.stepText}>{steps}</Animated.Text>
            <Text style={styles.stepsLabel}>steps</Text>
            <Text style={styles.goalText}>Goal: {dailyGoal}</Text>
          </View>
        </Animated.View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="walk" size={24} color="#FFD700" />
            <Text style={styles.statValue}>{steps}</Text>
            <Text style={styles.statLabel}>TODAY</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color="#FFD700" />
            <Text style={styles.statValue}>{weeklySteps}</Text>
            <Text style={styles.statLabel}>THIS WEEK</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#FFD700" />
            <Text style={styles.statValue}>{monthlySteps}</Text>
            <Text style={styles.statLabel}>THIS MONTH</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weekly Progress</Text>
          <LineChart
            data={weeklyData}
            width={Dimensions.get('window').width * 0.9}
            height={220}
            chartConfig={{
              backgroundColor: "#1E1E2C",
              backgroundGradientFrom: "#1E1E2C",
              backgroundGradientTo: "#1E1E2C",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "6", strokeWidth: "2", stroke: "#FFD700" }
            }}
            bezier
            style={styles.chart}
          />
        </View>
        
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>
            {steps < 5000 ? "Keep moving! You're making progress! 🚶" : 
             steps < 10000 ? "Great job! You're halfway to your goal! 🏃" : 
             "Amazing! You've crushed your goal today! 🏆"}
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );

  const renderHistory = () => (
    <Animated.View style={[styles.historyContainer, { opacity: animatedOpacity }]}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.historyTitle}>Your Step History</Text>
        
        {/* Daily Steps Card */}
        <View style={styles.historyCard}>
          <Ionicons name="walk" size={50} color="#fff" />
          <Text style={styles.cardTitle}>Today</Text>
          <Text style={styles.cardSteps}>{steps} Steps</Text>
          <Progress.Circle 
            progress={progressPercentage / 100} 
            size={100}
            color="#4CAF50"
            unfilledColor="#2A2A40"
            borderWidth={0}
            thickness={8}
            showsText={true}
            formatText={() => `${progressPercentage.toFixed(0)}%`}
            textStyle={styles.progressText}
          />
        </View>

        {/* Weekly Steps Card */}
        <View style={styles.historyCard}>
          <Ionicons name="calendar-outline" size={50} color="#fff" />
          <Text style={styles.cardTitle}>This Week</Text>
          <Text style={styles.cardSteps}>{weeklySteps} Steps</Text>
          <BarChart
            data={monthlyData}
            width={Dimensions.get('window').width * 0.8}
            height={200}
            chartConfig={{
              backgroundColor: "#1E1E2C",
              backgroundGradientFrom: "#1E1E2C",
              backgroundGradientTo: "#1E1E2C",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 }
            }}
            style={styles.chart}
            fromZero={true}
          />
        </View>

        {/* Monthly Steps Card */}
        <View style={styles.historyCard}>
          <Ionicons name="calendar" size={50} color="#fff" />
          <Text style={styles.cardTitle}>This Month</Text>
          <Text style={styles.cardSteps}>{monthlySteps} Steps</Text>
          <PieChart
            data={pieData}
            width={Dimensions.get('window').width * 0.8}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="steps"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chart}
          />
        </View>

        {/* Step History Table */}
        <View style={styles.historyTable}>
          <Text style={styles.tableTitle}>Daily Step Count</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Day</Text>
            <Text style={styles.headerText}>Steps</Text>
            <Text style={styles.headerText}>Progress</Text>
          </View>
          {stepHistory.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.rowText}>{item.day}</Text>
              <Text style={styles.rowText}>{item.steps}</Text>
              <Progress.Bar 
                progress={item.steps / dailyGoal} 
                width={100}
                height={8}
                color="#4CAF50"
                unfilledColor="#2A2A40"
                borderWidth={0}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="warning" size={50} color="#FFD700" />
      <Text style={styles.errorText}>Connection Error</Text>
      <Text style={styles.errorSubText}>We're using local data. Some features may be limited.</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => {
          setApiError(false);
          loadSteps();
        }}
      >
        <Text style={styles.retryButtonText}>Retry Connection</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1A2151', '#1E1E2C', '#0D0D1A']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons 
            name="speedometer" 
            size={24} 
            color={activeTab === 'dashboard' ? '#FFD700' : '#9090A0'} 
          />
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTab]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons 
            name="time" 
            size={24} 
            color={activeTab === 'history' ? '#FFD700' : '#9090A0'} 
          />
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTab]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading your step data...</Text>
        </View>
      ) : apiError ? (
        renderErrorState()
      ) : (
        <>
          {activeTab === 'dashboard' ? renderDashboard() : renderHistory()}
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A40',
  },
  tabButton: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    color: '#9090A0',
    marginTop: 5,
  },
  activeTab: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  dashboardScrollView: {
    width: '100%',
    paddingHorizontal: 15,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    letterSpacing: 1,
    textAlign: 'center',
  },
  circleContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  mainCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
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
    marginVertical: 20,
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
    marginVertical: 5,
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
    marginTop: 10,
  },
  motivationText: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: 'rgba(30, 30, 50, 0.7)',
    borderRadius: 12,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D3D5C',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  historyContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 15,
  },
  scrollView: {
    paddingBottom: 30,
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
  },
  historyCard: {
    width: '100%',
    backgroundColor: 'rgba(30, 30, 50, 0.9)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#3D3D5C',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  cardSteps: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  progressText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  historyTable: {
    width: '100%',
    backgroundColor: 'rgba(30, 30, 50, 0.9)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3D3D5C',
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D5C',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(61, 61, 92, 0.5)',
  },
  rowText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 15,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});