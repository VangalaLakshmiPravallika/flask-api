import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Animated,
  StatusBar,
  Dimensions,
  ScrollView,
  RefreshControl
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Appbar, Switch, useTheme } from "react-native-paper";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

const { width } = Dimensions.get("window");

// Custom Pie Chart Component with labels
const SimplePieChart = ({ data, size = 150 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let startAngle = 0;
  
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {data.map((item, index) => {
        const angle = (item.value / total) * 360;
        const midAngle = startAngle + angle / 2;
        const radius = size * 0.4;
        const x = radius * Math.cos((midAngle * Math.PI) / 180);
        const y = radius * Math.sin((midAngle * Math.PI) / 180);
        
        const sliceStyle = {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'transparent',
          transform: [
            { rotate: `${startAngle}deg` },
          ],
        };
        startAngle += angle;
        
        return (
          <View key={index} style={sliceStyle}>
            <View
              style={{
                width: size / 2,
                height: size,
                backgroundColor: item.color,
                borderTopLeftRadius: size / 2,
                borderBottomLeftRadius: size / 2,
                transform: [
                  { translateX: size / 4 },
                  { rotate: `${angle}deg` },
                  { translateX: -size / 4 },
                ],
              }}
            />
            {/* Label for each pie slice */}
            <Text 
              style={{
                position: 'absolute',
                left: size / 2 + x - 15,
                top: size / 2 + y - 10,
                fontSize: 10,
                fontWeight: 'bold',
                color: '#000',
                backgroundColor: 'rgba(255,255,255,0.7)',
                padding: 2,
                borderRadius: 3
              }}
            >
              {item.type}
            </Text>
          </View>
        );
      })}
      <View style={{
        position: 'absolute',
        width: size * 0.6,
        height: size * 0.6,
        borderRadius: size * 0.3,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Total</Text>
        <Text style={{ fontSize: 16 }}>{total}</Text>
      </View>
    </View>
  );
};

const AchievementsWall = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("All");
  const [darkMode, setDarkMode] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const theme = useTheme();

  // Group achievements by their first word
  const achievementGroups = achievements.reduce((groups, achievement) => {
    const groupName = achievement.title.split(' ')[0];
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(achievement);
    return groups;
  }, {});

  const groupNames = Object.keys(achievementGroups);
  const filters = ["All", ...groupNames];

  // Chart data based on achievement groups
  const chartData = Object.entries(achievementGroups).map(([group, items]) => ({
    type: group,
    value: items.length,
    color: getRandomColor()
  }));

  function getRandomColor() {
    const colors = ["#6A11CB", "#2575FC", "#FF4757", "#4CAF50", "#FFC107"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  useEffect(() => {
    fetchAchievements();
    animateHeader();
  }, []);

  const animateHeader = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const fetchAchievements = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        "https://healthfitnessbackend.onrender.com/api/get-achievements",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      const achievementsWithIds = data.map((item, index) => ({
        ...item,
        id: item.id || `${Date.now()}-${index}`
      }));
      setAchievements(achievementsWithIds);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAchievements();
  };

  const clearAchievements = () => {
    Alert.alert(
      "Clear Achievements",
      "Are you sure you want to clear all logs?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", onPress: confirmClear },
      ]
    );
  };

  const confirmClear = async () => {
    try {
      await AsyncStorage.removeItem("achievements");
      setAchievements([]);
      Alert.alert("Cleared", "Achievement logs deleted!");
    } catch (error) {
      Alert.alert("Error", "Failed to clear achievements.");
    }
  };

  const filteredAchievements = filter === "All" 
    ? achievements 
    : achievementGroups[filter] || [];

  const renderAchievementCard = ({ item }) => {
    const cardScale = new Animated.Value(0.95);
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View
        style={[
          styles.achievementCard,
          { 
            transform: [{ scale: cardScale }],
            backgroundColor: darkMode ? "#2C3E50" : "#FFFFFF",
            shadowColor: darkMode ? "#000" : "#6A11CB",
          },
        ]}
      >
        <View style={styles.cardContent}>
          <Text style={[styles.title, { color: darkMode ? "#FFF" : "#2C3E50" }]}>
            {item.title}
          </Text>
          <Text
            style={[styles.description, { color: darkMode ? "#DDD" : "#555" }]}
          >
            {item.description}
          </Text>
          <View style={styles.userContainer}>
            <Icon
              name="person"
              size={14}
              color={darkMode ? "#AAA" : "#777"}
            />
            <Text style={[styles.user, { color: darkMode ? "#AAA" : "#777" }]}>
              {item.user}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: darkMode ? "#121212" : "#F8F9FA" },
      ]}
    >
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={darkMode ? "#121212" : "#6A11CB"}
      />

      <Appbar.Header
        style={{
          backgroundColor: darkMode ? "#1E1E1E" : "#6A11CB",
          elevation: 0,
        }}
      >
        <Appbar.Content
          title="🏆 Achievements Wall"
          titleStyle={{ fontWeight: "bold", color: "white" }}
        />
        <View style={styles.switchContainer}>
          <Icon
            name={darkMode ? "nights-stay" : "wb-sunny"}
            size={20}
            color="white"
          />
          <Switch
            value={darkMode}
            onValueChange={() => setDarkMode(!darkMode)}
            color="#2575FC"
            style={{ marginLeft: 8 }}
          />
        </View>
      </Appbar.Header>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterScroll}
      >
        {filters.map((filterName) => (
          <TouchableOpacity
            key={filterName}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  filter === filterName
                    ? darkMode
                      ? "#2575FC"
                      : "#6A11CB"
                    : darkMode
                    ? "#2C3E50"
                    : "#EEE",
              },
            ]}
            onPress={() => setFilter(filterName)}
          >
            <Text
              style={{
                color: filter === filterName ? "white" : darkMode ? "#DDD" : "#555",
                fontWeight: "600",
              }}
            >
              {filterName} {filterName !== "All" && `(${achievementGroups[filterName]?.length || 0})`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.chartContainer}>
        <Text style={[styles.sectionTitle, { color: darkMode ? "#FFF" : "#2C3E50" }]}>
          Achievement Types
        </Text>
        <View style={styles.chartRow}>
          <SimplePieChart 
            data={chartData} 
            size={width * 0.4} 
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          {[...Array(3)].map((_, i) => (
            <ShimmerPlaceholder
              key={i}
              style={styles.shimmerCard}
              shimmerColors={
                darkMode
                  ? ["#2C3E50", "#3B4E6D", "#2C3E50"]
                  : ["#EEE", "#DDD", "#EEE"]
              }
            />
          ))}
        </View>
      ) : filteredAchievements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon
            name="emoji-events"
            size={60}
            color={darkMode ? "#555" : "#CCC"}
          />
          <Text style={[styles.emptyText, { color: darkMode ? "#DDD" : "#555" }]}>
            {filter === "All" ? "No achievements yet!" : `No ${filter} achievements`}
          </Text>
          <Text
            style={[styles.emptySubtext, { color: darkMode ? "#AAA" : "#777" }]}
          >
            {filter === "All" 
              ? "Complete some challenges to see achievements here" 
              : `Complete some ${filter} challenges to see achievements here`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAchievements}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAchievementCard}
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6A11CB"]}
              tintColor={darkMode ? "#6A11CB" : "#6A11CB"}
            />
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={clearAchievements}>
        <Icon name="delete" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  filterContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  filterScroll: {
    paddingHorizontal: 15,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  chartContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: 'center'
  },
  chartRow: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    padding: 15,
  },
  shimmerCard: {
    height: 100,
    borderRadius: 12,
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
  },
  scrollContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  achievementCard: {
    marginBottom: 15,
    borderRadius: 15,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  cardContent: {
    padding: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    marginBottom: 10,
    lineHeight: 22,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  user: {
    fontSize: 14,
    fontStyle: "italic",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF4757",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default AchievementsWall;