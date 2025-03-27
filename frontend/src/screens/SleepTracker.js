import React, { useEffect, useState, useRef } from "react";
import { 
  View, Text, TouchableOpacity, Alert, StyleSheet, 
  Dimensions, ScrollView, Animated , AppState, ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; 
import axios from "axios";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart, PieChart } from "react-native-chart-kit";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_MARGIN = 16;
const CHART_WIDTH = SCREEN_WIDTH - (CHART_MARGIN * 2) - 32; 

const SleepTracker = () => {
  const [sleepDetected, setSleepDetected] = useState(false);
  const [sleepHours, setSleepHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sleepHistory, setSleepHistory] = useState([]);
  const [sleepQuality, setSleepQuality] = useState(0);
  const navigation = useNavigation();
  const appState = useRef(AppState.currentState);

  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();

    checkSleep();
    fetchSleepHistory();
  }, []);

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

  const fetchSleepHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;
      
      const response = await axios.get(
        "https://healthfitnessbackend.onrender.com/api/sleep-history",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const history = response.data.history || [];
      setSleepHistory(history);
      setSleepQuality(response.data.sleep_quality || 0);
    } catch (error) {
      console.error("Error fetching sleep history:", error);
      Alert.alert("Error", "Failed to fetch sleep history");
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

      const response = await axios.post(
        "https://healthfitnessbackend.onrender.com/api/log-sleep",
        {
          date: new Date().toISOString().split("T")[0],
          sleep_hours: sleepHours,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", response.data.message);
      fetchSleepHistory();
    } catch (error) {
      console.error("Error logging sleep:", error);
      Alert.alert("Error", "Failed to log sleep data.");
    }
  };

  const renderSleepCharts = () => {
    const chartHeight = 220;
    
    const chartConfig = {
      backgroundGradientFrom: "#1E293B",
      backgroundGradientTo: "#1E293B",
      fillShadowGradientFrom: "#7C4DFF",
      fillShadowGradientTo: "rgba(124, 77, 255, 0.1)",
      fillShadowGradientFromOpacity: 0.8,
      fillShadowGradientToOpacity: 0.1,
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      strokeWidth: 3,
      barPercentage: 0.5,
      decimalPlaces: 1,
      propsForDots: {
        r: "5",
        strokeWidth: "2",
        stroke: "#7C4DFF",
        fill: "#1E293B"
      },
      propsForBackgroundLines: {
        strokeWidth: 0.5,
        stroke: "rgba(255, 255, 255, 0.1)",
        strokeDasharray: "0"
      },
      propsForLabels: {
        fontSize: 10
      }
    };

    const safeSleepHistory = sleepHistory.length > 0 
      ? sleepHistory 
      : Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
          sleep_hours: Math.min(9, Math.max(4, 6.5 + Math.random() * 2 - 1)),
          sleep_quality: Math.min(100, Math.max(60, 75 + Math.random() * 20 - 10))
        }));

    const chartData = {
      labels: safeSleepHistory.map(item => 
        new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
      ),
      datasets: [
        {
          data: safeSleepHistory.map(item => item.sleep_hours || 0),
          color: (opacity = 1) => `rgba(124, 77, 255, ${opacity})`,
          strokeWidth: 3
        }
      ],
      legend: ["Sleep Hours"]
    };

    const sleepCycleData = [
      {
        name: "Deep",
        population: 35,
        color: "#7C4DFF",
        legendFontColor: "#fff",
        legendFontSize: 12
      },
      {
        name: "REM",
        population: 30,
        color: "#00BCD4",
        legendFontColor: "#fff",
        legendFontSize: 12
      },
      {
        name: "Light",
        population: 35,
        color: "#FF9800",
        legendFontColor: "#fff",
        legendFontSize: 12
      }
    ];

    return (
      <Animatable.View 
        animation="fadeIn" 
        duration={1000} 
        style={styles.chartsContainer}
      >
        {/* Sleep Hours Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>SLEEP DURATION</Text>
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              width={CHART_WIDTH}
              height={chartHeight}
              yAxisLabel=""
              yAxisSuffix="h"
              yAxisInterval={1}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withHorizontalLabels={true}
              withVerticalLabels={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withDots={true}
              withShadow={true}
              withInnerLines={false}
              segments={4}
              fromZero={false}
              formatYLabel={(value) => `${parseFloat(value).toFixed(1)}`}
            />
            <View style={styles.xAxisLabel}>
              <Text style={styles.xAxisLabelText}>Last 7 Days</Text>
            </View>
          </View>
        </View>

        {/* Sleep Cycle Breakdown */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>SLEEP CYCLE BREAKDOWN</Text>
          <PieChart
            data={sleepCycleData}
            width={CHART_WIDTH}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={true}
          />
        </View>

        {/* Sleep Quality Score */}
        <View style={styles.sleepQualityContainer}>
          <Text style={styles.sleepQualityTitle}>OVERALL SLEEP QUALITY</Text>
          <Animated.Text 
            style={[
              styles.sleepQualityText, 
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            {sleepQuality}/100
          </Animated.Text>
        </View>
      </Animatable.View>
    );
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#334155']}
      style={styles.backgroundGradient}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <BlurView intensity={30} style={styles.blurContainer}>
          <Animatable.Text 
            animation="zoomIn" 
            style={styles.header}
          >
            🌙 SLEEP TRACKER
          </Animatable.Text>

          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : (
            <Animated.View 
              style={[
                styles.sleepInfoContainer, 
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              {sleepDetected ? (
                <>
                  <Text style={styles.sleepText}>😴 AUTO-DETECTED SLEEP</Text>
                  <Text style={styles.sleepHoursText}>{sleepHours} hours</Text>
                </>
              ) : (
                <Text style={styles.noSleepText}>🌞 NO SLEEP DETECTED</Text>
              )}
            </Animated.View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.logButton} 
              onPress={logSleepToBackend}
            >
              <LinearGradient
                colors={['#6A1B9A', '#9C27B0']}
                style={styles.buttonGradient}
              >
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>LOG SLEEP</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.yogaButton} 
              onPress={() => navigation.navigate("SoothingMusic")}
            >
              <LinearGradient
                colors={['#00695C', '#009688']}
                style={styles.buttonGradient}
              >
                <MaterialCommunityIcons 
                  name="meditation" 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.buttonText}>RELAXATION</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {!loading && renderSleepCharts()}
        </BlurView>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backgroundGradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: CHART_MARGIN,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  sleepInfoContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  sleepText: {
    color: '#E2E8F0',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  sleepHoursText: {
    color: '#4CAF50',
    fontSize: 28,
    fontWeight: '700',
  },
  noSleepText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    height: 50,
  },
  yogaButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 12,
    overflow: 'hidden',
    height: 50,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
    letterSpacing: 0.5
  },
  chartsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  chartCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    width: '100%',
    alignItems: 'center',
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  chartTitle: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  chart: {
    borderRadius: 12,
    marginTop: 10,
  },
  xAxisLabel: {
    position: 'absolute',
    bottom: -20,
    width: '100%',
    alignItems: 'center'
  },
  xAxisLabelText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5
  },
  sleepQualityContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    width: '100%',
  },
  sleepQualityTitle: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  sleepQualityText: {
    color: '#4CAF50',
    fontSize: 24,
    fontWeight: '700',
  },
});

export default SleepTracker;