import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, 
  TouchableOpacity, RefreshControl, StyleSheet 
} from "react-native";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LeaderboardScreen = () => {
  const route = useRoute();
  const { challengeId } = route.params; // Get challenge ID from navigation
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(
        `https://healthfitnessbackend.onrender.com/api/leaderboard/${challengeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaderboard(response.data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.leaderboardItem}>
      <Text style={styles.rank}>{index + 1}</Text>
      <Text style={styles.name}>{item.user}</Text>
      <Text style={styles.progress}>{item.progress}%</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <TouchableOpacity onPress={fetchLeaderboard}>
          <Ionicons name="refresh" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item, index) => `leaderboard-${index}`}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No participants yet</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 16,
    paddingTop: 20
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333"
  },
  loader: {
    marginTop: 20
  },
  leaderboardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  rank: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    width: 30
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333"
  },
  progress: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745"
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666"
  }
});

export default LeaderboardScreen;
