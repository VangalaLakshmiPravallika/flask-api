import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert, 
  AppState 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AchievementsWall = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();

    const subscription = AppState.addEventListener("change", nextAppState => {
      console.log("App State changed:", nextAppState);
    });

    return () => {
      subscription.remove(); 
    };
  }, []);

  const fetchAchievements = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch("https://healthfitnessbackend.onrender.com/api/get-achievements", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log("Fetched Achievements:", data);
      setAchievements(data);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearAchievements = async () => {
    try {
      Alert.alert(
        "Clear Achievements",
        "Are you sure you want to clear all achievements?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Clear",
            onPress: async () => {
              await AsyncStorage.removeItem("achievements"); 
              setAchievements([]); 
              Alert.alert("Success", "Achievement logs cleared!");
            },
            style: "destructive"
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to clear achievements.");
      console.error("Error clearing achievements:", error);
    }
  };

  // Helper function to determine badge emoji based on title text
  const getBadgeEmoji = (title) => {
    const lowerTitle = title?.toLowerCase() || "";
    if (lowerTitle.includes("run") || lowerTitle.includes("marathon")) return "🏃";
    if (lowerTitle.includes("swim")) return "🏊";
    if (lowerTitle.includes("bike") || lowerTitle.includes("cycle")) return "🚴";
    if (lowerTitle.includes("lift") || lowerTitle.includes("strength")) return "🏋️";
    if (lowerTitle.includes("yoga")) return "🧘";
    if (lowerTitle.includes("goal")) return "🎯";
    return "🏆"; // Default trophy
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Achievements Wall</Text>
        <Text style={styles.subheading}>Your fitness journey highlights</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      ) : achievements.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateEmoji}>💪</Text>
          <Text style={styles.emptyStateTitle}>No achievements yet</Text>
          <Text style={styles.emptyStateMessage}>
            Keep pushing your limits and your accomplishments will be showcased here!
          </Text>
        </View>
      ) : (
        <FlatList
          data={achievements}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.achievementCard}>
              <View style={styles.achievementHeader}>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeEmoji}>{getBadgeEmoji(item.title)}</Text>
                </View>
                <Text style={styles.title}>{item.title}</Text>
              </View>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.user}>Achieved by {item.user}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity 
        style={styles.clearButton}
        onPress={clearAchievements}
      >
        <Text style={styles.clearButtonText}>Clear Achievement Logs</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#F5F9F6" 
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 12
  },
  heading: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#2E7D32", 
    marginBottom: 4
  },
  subheading: {
    fontSize: 16,
    color: "#689F38",
    marginBottom: 8
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    marginTop: 12,
    color: "#689F38",
    fontSize: 16
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  emptyStateEmoji: {
    fontSize: 50,
    marginBottom: 16
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8
  },
  emptyStateMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#689F38",
    lineHeight: 22
  },
  scrollContainer: { 
    paddingBottom: 16
  },
  achievementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden"
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F1F8E9",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  badgeContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeEmoji: {
    fontSize: 22
  },
  title: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#2E7D32",
    flex: 1
  },
  description: { 
    fontSize: 16, 
    color: "#455A64", 
    padding: 16,
    lineHeight: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  cardFooter: {
    padding: 12,
    backgroundColor: "#FAFAFA"
  },
  user: { 
    fontSize: 14, 
    fontStyle: "italic", 
    color: "#757575"
  },
  clearButton: { 
    backgroundColor: "#E57373",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16
  }
});

export default AchievementsWall;