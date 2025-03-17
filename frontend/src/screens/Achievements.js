import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AchievementsWall = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchAchievements();
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

  const postToGroup = async (badgeTitle) => {
    try {
      setPosting(true);
      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch("https://healthfitnessbackend.onrender.com/api/post-badge", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_name: "Fitness Achievers",
          badge: badgeTitle,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Badge posted to the group!");
      } else {
        Alert.alert("Error", result.error || "Failed to post badge.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not post badge.");
      console.error("Error posting badge:", error);
    } finally {
      setPosting(false);
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
        <Text style={styles.subheading}>Track your fitness milestones</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3E92CC" />
          <Text style={styles.loadingText}>Loading your achievements...</Text>
        </View>
      ) : achievements.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateEmoji}>🏋️</Text>
          <Text style={styles.emptyStateTitle}>No achievements yet</Text>
          <Text style={styles.emptyStateMessage}>Keep working towards your goals and milestones will appear here!</Text>
        </View>
      ) : (
        <FlatList
          data={achievements}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.achievementCard}>
              <View style={styles.cardHeader}>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeEmoji}>{getBadgeEmoji(item.title)}</Text>
                </View>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.user}>Achieved by {item.user}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              <TouchableOpacity
                style={[styles.shareButton, posting ? styles.shareButtonDisabled : null]}
                onPress={() => postToGroup(item.title)}
                disabled={posting}
              >
                <Text style={styles.shareButtonText}>
                  {posting ? "Posting..." : "📢 Share with Fitness Achievers"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F7FA",
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8ED",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    color: "#7F8C8D",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#7F8C8D",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#7F8C8D",
    lineHeight: 22,
  },
  scrollContainer: {
    paddingBottom: 20,
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
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F2F6",
  },
  badgeContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E6F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 2,
  },
  user: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  cardBody: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: "#34495E",
    lineHeight: 22,
  },
  shareButton: {
    backgroundColor: "#3E92CC",
    padding: 14,
    alignItems: "center",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  shareButtonDisabled: {
    backgroundColor: "#A4C2DC",
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default AchievementsWall;