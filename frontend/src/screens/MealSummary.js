import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Card, Badge, Divider } from "react-native-paper";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

const MealSummary = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list"); 
  const [selectedMetric, setSelectedMetric] = useState("calories");
  const [timeRange, setTimeRange] = useState("week"); 

  useEffect(() => {
    fetchLoggedMeals();
  }, []);

  const fetchLoggedMeals = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Login Required", "Please log in first.");
        return;
      }
      
      const response = await axios.get("https://healthfitnessbackend.onrender.com/api/get-meals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (Array.isArray(response.data.meals) && response.data.meals.length > 0) {
        const sortedMeals = response.data.meals.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setMeals(sortedMeals);
      } else {
        setMeals([]);
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
      Alert.alert("Error", "Failed to load meals.");
    } finally {
      setLoading(false);
    }
  };

  const nutritionStats = useMemo(() => {
    if (!meals.length) return null;
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let daysLogged = meals.length;
    
    meals.forEach(meal => {
      if (meal.nutrition) {
        totalCalories += Number(meal.nutrition.calories || 0);
        totalProtein += Number(meal.nutrition.protein || 0);
        totalCarbs += Number(meal.nutrition.carbs || 0);
        totalFats += Number(meal.nutrition.fats || 0);
      }
    });
    
    return {
      avgCalories: (totalCalories / daysLogged).toFixed(0),
      avgProtein: (totalProtein / daysLogged).toFixed(1),
      avgCarbs: (totalCarbs / daysLogged).toFixed(1),
      avgFats: (totalFats / daysLogged).toFixed(1),
      totalDays: daysLogged,
    };
  }, [meals]);

  const chartData = useMemo(() => {
    if (!meals.length) return null;

    let filteredMeals = [...meals];
    const now = new Date();
    
    if (timeRange === "week") {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filteredMeals = meals.filter(meal => new Date(meal.date) >= oneWeekAgo);
    } else if (timeRange === "month") {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filteredMeals = meals.filter(meal => new Date(meal.date) >= oneMonthAgo);
    }

    const lineData = {
      labels: filteredMeals.slice(0, 7).map(meal => {
        const date = new Date(meal.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }).reverse(),
      datasets: [
        {
          data: filteredMeals.slice(0, 7).map(meal => 
            Number(meal.nutrition?.[selectedMetric] || 0)
          ).reverse(),
          color: () => selectedMetric === "calories" ? "#FF6B6B" : 
                       selectedMetric === "protein" ? "#4ECDC4" : 
                       selectedMetric === "carbs" ? "#FFE66D" : "#6A0572",
          strokeWidth: 2,
        }
      ],
    };

    const totalProtein = filteredMeals.reduce((sum, meal) => sum + Number(meal.nutrition?.protein || 0), 0);
    const totalCarbs = filteredMeals.reduce((sum, meal) => sum + Number(meal.nutrition?.carbs || 0), 0);
    const totalFats = filteredMeals.reduce((sum, meal) => sum + Number(meal.nutrition?.fats || 0), 0);
    
    const pieData = [
      {
        name: "Protein",
        value: totalProtein,
        color: "#4ECDC4",
        legendFontColor: "#7F7F7F",
        legendFontSize: 13
      },
      {
        name: "Carbs",
        value: totalCarbs,
        color: "#FFE66D",
        legendFontColor: "#7F7F7F",
        legendFontSize: 13
      },
      {
        name: "Fats",
        value: totalFats,
        color: "#6A0572",
        legendFontColor: "#7F7F7F",
        legendFontSize: 13
      }
    ];
    
    const barData = {
      labels: ["Breakfast", "Lunch", "Snacks", "Dinner"],
      datasets: [
        {
          data: [
            filteredMeals.filter(meal => meal.meals?.breakfast && meal.meals.breakfast !== "Not logged").length,
            filteredMeals.filter(meal => meal.meals?.lunch && meal.meals.lunch !== "Not logged").length,
            filteredMeals.filter(meal => meal.meals?.snacks && meal.meals.snacks !== "Not logged").length,
            filteredMeals.filter(meal => meal.meals?.dinner && meal.meals.dinner !== "Not logged").length
          ]
        }
      ]
    };
    
    return { lineData, pieData, barData };
  }, [meals, selectedMetric, timeRange]);

  const renderListView = () => (
    <FlatList
      data={meals}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <Card style={styles.mealCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.dateText}>{item.date || "N/A"}</Text>
              <Badge style={styles.caloriesBadge}>{item.nutrition?.calories || 0} kcal</Badge>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.mealGrid}>
              <View style={styles.mealItem}>
                <View style={styles.mealIconContainer}>
                  <Ionicons name="sunny-outline" size={16} color="#FF8C42" />
                </View>
                <View style={styles.mealContent}>
                  <Text style={styles.mealLabel}>Breakfast</Text>
                  <Text style={styles.mealText}>{item.meals?.breakfast || "Not logged"}</Text>
                </View>
              </View>
              
              <View style={styles.mealItem}>
                <View style={styles.mealIconContainer}>
                  <Ionicons name="restaurant-outline" size={16} color="#6A0572" />
                </View>
                <View style={styles.mealContent}>
                  <Text style={styles.mealLabel}>Lunch</Text>
                  <Text style={styles.mealText}>{item.meals?.lunch || "Not logged"}</Text>
                </View>
              </View>
              
              <View style={styles.mealItem}>
                <View style={styles.mealIconContainer}>
                  <Ionicons name="cafe-outline" size={16} color="#FFE66D" />
                </View>
                <View style={styles.mealContent}>
                  <Text style={styles.mealLabel}>Snacks</Text>
                  <Text style={styles.mealText}>{item.meals?.snacks || "Not logged"}</Text>
                </View>
              </View>
              
              <View style={styles.mealItem}>
                <View style={styles.mealIconContainer}>
                  <Ionicons name="moon-outline" size={16} color="#4ECDC4" />
                </View>
                <View style={styles.mealContent}>
                  <Text style={styles.mealLabel}>Dinner</Text>
                  <Text style={styles.mealText}>{item.meals?.dinner || "Not logged"}</Text>
                </View>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.nutritionContainer}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Protein</Text>
                <Text style={[styles.nutritionValue, styles.proteinColor]}>{item.nutrition?.protein || 0}g</Text>
              </View>
              
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Carbs</Text>
                <Text style={[styles.nutritionValue, styles.carbsColor]}>{item.nutrition?.carbs || 0}g</Text>
              </View>
              
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Fats</Text>
                <Text style={[styles.nutritionValue, styles.fatsColor]}>{item.nutrition?.fats || 0}g</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}
    />
  );

  const renderChartsView = () => {
    if (!chartData) return <Text style={styles.noMealsText}>No meal data to display charts</Text>;
    
    return (
      <ScrollView>
        <View style={styles.timeRangeSelector}>
          <TouchableOpacity 
            style={[styles.timeRangeButton, timeRange === "week" && styles.activeTimeRange]}
            onPress={() => setTimeRange("week")}
          >
            <Text style={[styles.timeRangeText, timeRange === "week" && styles.activeTimeRangeText]}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.timeRangeButton, timeRange === "month" && styles.activeTimeRange]}
            onPress={() => setTimeRange("month")}
          >
            <Text style={[styles.timeRangeText, timeRange === "month" && styles.activeTimeRangeText]}>Month</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.timeRangeButton, timeRange === "all" && styles.activeTimeRange]}
            onPress={() => setTimeRange("all")}
          >
            <Text style={[styles.timeRangeText, timeRange === "all" && styles.activeTimeRangeText]}>All</Text>
          </TouchableOpacity>
        </View>
  
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>Nutrition Trends</Text>
            <View style={styles.metricSelector}>
              <TouchableOpacity 
                style={[styles.metricButton, selectedMetric === "calories" && styles.activeMetric]}
                onPress={() => setSelectedMetric("calories")}
              >
                <Text style={[styles.metricText, selectedMetric === "calories" && styles.activeMetricText]}>Calories</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.metricButton, selectedMetric === "protein" && styles.activeMetric]}
                onPress={() => setSelectedMetric("protein")}
              >
                <Text style={[styles.metricText, selectedMetric === "protein" && styles.activeMetricText]}>Protein</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.metricButton, selectedMetric === "carbs" && styles.activeMetric]}
                onPress={() => setSelectedMetric("carbs")}
              >
                <Text style={[styles.metricText, selectedMetric === "carbs" && styles.activeMetricText]}>Carbs</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.metricButton, selectedMetric === "fats" && styles.activeMetric]}
                onPress={() => setSelectedMetric("fats")}
              >
                <Text style={[styles.metricText, selectedMetric === "fats" && styles.activeMetricText]}>Fats</Text>
              </TouchableOpacity>
            </View>
            
            <LineChart
              data={chartData.lineData}
              width={screenWidth - 60}
              height={220}
              chartConfig={{
                backgroundColor: "#FFFFFF",
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </Card.Content>
        </Card>
  
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>Macro Nutrient Distribution</Text>
            <PieChart
              data={chartData.pieData}
              width={screenWidth - 60}
              height={220}
              chartConfig={{
                backgroundColor: "#FFFFFF",
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor={"value"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute
            />
          </Card.Content>
        </Card>
  
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>Meal Completion Rate</Text>
            <BarChart
              data={chartData.barData}
              width={screenWidth - 60}
              height={220}
              chartConfig={{
                backgroundColor: "#FFFFFF",
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(106, 5, 114, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  const renderStatsView = () => {
    if (!nutritionStats) return <Text style={styles.noMealsText}>No meal data to display statistics</Text>;
    
    return (
      <ScrollView>
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.statsTitle}>Daily Averages</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statsIconContainer, styles.caloriesStat]}>
                  <Ionicons name="flame-outline" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{nutritionStats.avgCalories}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statsIconContainer, styles.proteinStat]}>
                  <Ionicons name="barbell-outline" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{nutritionStats.avgProtein}g</Text>
                <Text style={styles.statLabel}>Protein</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statsIconContainer, styles.carbsStat]}>
                  <Ionicons name="grid-outline" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{nutritionStats.avgCarbs}g</Text>
                <Text style={styles.statLabel}>Carbs</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statsIconContainer, styles.fatsStat]}>
                  <Ionicons name="water-outline" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{nutritionStats.avgFats}g</Text>
                <Text style={styles.statLabel}>Fats</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryItem}>
              <Ionicons name="calendar-outline" size={20} color="#6A0572" />
              <Text style={styles.summaryText}>You've logged meals for {nutritionStats.totalDays} days</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Ionicons name="trending-up-outline" size={20} color="#6A0572" />
              <Text style={styles.summaryText}>Average daily intake: {nutritionStats.avgCalories} calories</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Ionicons name="nutrition-outline" size={20} color="#6A0572" />
              <Text style={styles.summaryText}>
                Macro ratio: {Math.round(nutritionStats.avgProtein * 4 / nutritionStats.avgCalories * 100)}% protein, 
                {Math.round(nutritionStats.avgCarbs * 4 / nutritionStats.avgCalories * 100)}% carbs, 
                {Math.round(nutritionStats.avgFats * 9 / nutritionStats.avgCalories * 100)}% fats
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "list":
        return renderListView();
      case "charts":
        return renderChartsView();
      case "stats":
        return renderStatsView();
      default:
        return renderListView();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Nutrition Tracker</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A0572" />
          <Text style={styles.loadingText}>Loading your meals...</Text>
        </View>
      ) : meals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={64} color="#CCCCCC" />
          <Text style={styles.noMealsText}>No meals logged yet.</Text>
          <Text style={styles.noMealsSubtext}>Start logging your meals to see your nutrition data!</Text>
        </View>
      ) : (
        <>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "list" && styles.activeTab]}
              onPress={() => setActiveTab("list")}
            >
              <Ionicons 
                name="list-outline" 
                size={24} 
                color={activeTab === "list" ? "#6A0572" : "#888888"} 
              />
              <Text style={[styles.tabText, activeTab === "list" && styles.activeTabText]}>
                Meals
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === "charts" && styles.activeTab]}
              onPress={() => setActiveTab("charts")}
            >
              <Ionicons 
                name="bar-chart-outline" 
                size={24} 
                color={activeTab === "charts" ? "#6A0572" : "#888888"} 
              />
              <Text style={[styles.tabText, activeTab === "charts" && styles.activeTabText]}>
                Charts
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === "stats" && styles.activeTab]}
              onPress={() => setActiveTab("stats")}
            >
              <Ionicons 
                name="stats-chart-outline" 
                size={24} 
                color={activeTab === "stats" ? "#6A0572" : "#888888"} 
              />
              <Text style={[styles.tabText, activeTab === "stats" && styles.activeTabText]}>
                Stats
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.contentContainer}>
            {renderContent()}
          </View>
        </>
      )}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("DietRecommendation")}>
        <Text style={styles.buttonText}>📊 View Diet Recommendation</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerContainer: {
    backgroundColor: "#6A0572",
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 4,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6A0572",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noMealsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6A0572",
    marginTop: 12,
  },
  noMealsSubtext: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
    marginTop: 6,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#F0E6F5",
  },
  tabText: {
    marginTop: 4,
    fontSize: 12,
    color: "#888888",
  },
  activeTabText: {
    color: "#6A0572",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  mealCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: "#FFFFFF",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333333",
  },
  caloriesBadge: {
    backgroundColor: "#FF6B6B",
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  divider: {
    backgroundColor: "#E0E0E0",
    height: 1,
    marginVertical: 8,
  },
  mealGrid: {
    marginVertical: 8,
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  mealIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  mealContent: {
    flex: 1,
  },
  mealLabel: {
    fontSize: 12,
    color: "#888888",
  },
  mealText: {
    fontSize: 14,
    color: "#333333",
  },
  nutritionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  nutritionItem: {
    alignItems: "center",
    padding: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#888888",
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  proteinColor: {
    color: "#4ECDC4",
  },
  carbsColor: {
    color: "#FFE66D",
  },
  fatsColor: {
    color: "#6A0572",
  },
  chartCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: "#FFFFFF",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  metricSelector: {
    flexDirection: "row",
    marginBottom: 16,
  },
  metricButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#F0F0F0",
  },
  activeMetric: {
    backgroundColor: "#6A0572",
  },
  metricText: {
    fontSize: 12,
    color: "#333333",
  },
  activeMetricText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  timeRangeSelector: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "center",
  },
  timeRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 6,
    backgroundColor: "#F0F0F0",
  },
  activeTimeRange: {
    backgroundColor: "#6A0572",
  },
  timeRangeText: {
    fontSize: 14,
    color: "#333333",
  },
  activeTimeRangeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  statsCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: "#FFFFFF",
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 16,
  },
  statsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  caloriesStat: {
    backgroundColor: "#FF6B6B",
  },
  proteinStat: {
    backgroundColor: "#4ECDC4",
  },
  carbsStat: {
    backgroundColor: "#FFE66D",
  },
  fatsStat: {
    backgroundColor: "#6A0572",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  statLabel: {
    fontSize: 14,
    color: "#888888",
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: "#FFFFFF",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  summaryText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 12,
  },
});

export default MealSummary;