import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert, 
  AppState,
  Animated,
  Share,
  SafeAreaView,
  StatusBar
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const AchievementsWall = ({ navigation }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fetchAchievements();

    // Animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();

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
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAchievements();
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

  const shareAchievement = async (achievement) => {
    try {
      await Share.share({
        message: `I just earned the "${achievement.title}" achievement! ${achievement.description} #FitnessJourney`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share achievement");
    }
  };

  // Helper function to determine badge emoji and color based on title text
  const getBadgeInfo = (title) => {
    const lowerTitle = title?.toLowerCase() || "";
    
    if (lowerTitle.includes("run") || lowerTitle.includes("marathon")) 
      return { emoji: "🏃", color: "#FF7043", bgColor: "#FBE9E7" };
    if (lowerTitle.includes("swim")) 
      return { emoji: "🏊", color: "#29B6F6", bgColor: "#E1F5FE" };
    if (lowerTitle.includes("bike") || lowerTitle.includes("cycle")) 
      return { emoji: "🚴", color: "#66BB6A", bgColor: "#E8F5E9" };
    if (lowerTitle.includes("lift") || lowerTitle.includes("strength")) 
      return { emoji: "🏋️", color: "#8D6E63", bgColor: "#EFEBE9" };
    if (lowerTitle.includes("yoga")) 
      return { emoji: "🧘", color: "#AB47BC", bgColor: "#F3E5F5" };
    if (lowerTitle.includes("goal")) 
      return { emoji: "🎯", color: "#EC407A", bgColor: "#FCE4EC" };
    
    // Default trophy
    return { emoji: "🏆", color: "#FFA000", bgColor: "#FFF8E1" };
  };

  const getTimeAgo = () => {
    const times = [
      "2 days ago", "1 week ago", "3 hours ago", 
      "just now", "5 days ago", "yesterday"
    ];
    return times[Math.floor(Math.random() * times.length)];
  };

  const renderAchievementItem = ({ item, index }) => {
    const { emoji, color, bgColor } = getBadgeInfo(item.title);
    // Stagger animation for each item
    const itemFadeAnim = useRef(new Animated.Value(0)).current;
    const itemTranslateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(itemFadeAnim, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true
        }),
        Animated.timing(itemTranslateY, {
          toValue: 0,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true
        })
      ]).start();
    }, []);

    return (
      <Animated.View 
        style={[
          styles.achievementCard,
          { 
            opacity: itemFadeAnim,
            transform: [{ translateY: itemTranslateY }]
          }
        ]}
      >
        <View style={[styles.achievementHeader, { backgroundColor: bgColor }]}>
          <View style={[styles.badgeContainer, { backgroundColor: color }]}>
            <Text style={styles.badgeEmoji}>{emoji}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color }]}>{item.title}</Text>
            <Text style={styles.timeAgo}>{getTimeAgo()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => Alert.alert("Options", "More options coming soon!")}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#757575" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.description}>{item.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="fitness-outline" size={18} color={color} />
              <Text style={styles.statText}>Level {Math.floor(Math.random() * 5) + 1}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={18} color="#F57C00" />
              <Text style={styles.statText}>{Math.floor(Math.random() * 100) + 50} pts</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{item.user.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.user}>{item.user}</Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert("Liked!", "You liked this achievement")}
            >
              <Ionicons name="heart-outline" size={22} color="#757575" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => shareAchievement(item)}
            >
              <Ionicons name="share-social-outline" size={22} color="#757575" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View 
      style={[
        styles.emptyStateContainer, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY }]
        }
      ]}
    >
      <View style={styles.emptyStateIconContainer}>
        <Ionicons name="trophy-outline" size={60} color="#BFC0C9" />
      </View>
      <Text style={styles.emptyStateTitle}>No achievements yet</Text>
      <Text style={styles.emptyStateMessage}>
        Keep pushing your limits and your accomplishments will be showcased here!
      </Text>
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => Alert.alert("Get Started", "Start tracking your fitness to earn achievements!")}
      >
        <Text style={styles.startButtonText}>Start Your Journey</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F5F9F6" barStyle="dark-content" />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>Achievements</Text>
            <Text style={styles.subheading}>Your fitness milestones</Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation && navigation.navigate("Settings")}
          >
            <Ionicons name="settings-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading achievements...</Text>
          </View>
        ) : (
          <FlatList
            data={achievements}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderAchievementItem}
            contentContainerStyle={[
              styles.scrollContainer,
              achievements.length === 0 && styles.emptyListContainer
            ]}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={renderEmptyState}
          />
        )}

        {achievements.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearAchievements}
          >
            <Ionicons name="trash-outline" size={18} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.clearButtonText}>Clear Achievement Logs</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.fabButton}
          onPress={() => Alert.alert("Create Achievement", "Track a new achievement!")}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F9F6"
  },
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#F5F9F6" 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0"
  },
  heading: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#2E7D32", 
    marginBottom: 4
  },
  subheading: {
    fontSize: 16,
    color: "#689F38"
  },
  headerButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F1F8E9"
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
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1F8E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 12
  },
  emptyStateMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#689F38",
    lineHeight: 24,
    marginBottom: 24
  },
  startButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2
  },
  startButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16
  },
  scrollContainer: { 
    paddingBottom: 80
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center"
  },
  achievementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden"
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingVertical: 14
  },
  badgeContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  badgeEmoji: {
    fontSize: 22
  },
  titleContainer: {
    flex: 1
  },
  title: { 
    fontSize: 18, 
    fontWeight: "bold"
  },
  timeAgo: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 4
  },
  moreButton: {
    padding: 4
  },
  cardBody: {
    padding: 16,
    paddingTop: 8
  },
  description: { 
    fontSize: 16, 
    color: "#455A64", 
    lineHeight: 24,
    marginBottom: 16
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 8
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16
  },
  statText: {
    fontSize: 14,
    color: "#757575", 
    marginLeft: 4
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FAFAFA",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0"
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center"
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8
  },
  userAvatarText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14
  },
  user: { 
    fontSize: 14, 
    color: "#455A64",
    fontWeight: "500"
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center"
  },
  actionButton: {
    padding: 6,
    marginLeft: 8
  },
  clearButton: { 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E57373",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  buttonIcon: {
    marginRight: 8
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16
  },
  fabButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  }
});

export default AchievementsWall;