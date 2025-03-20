import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute } from "@react-navigation/native";

const ChallengeDetailsScreen = () => {
  const route = useRoute();
  const { challenge } = route.params;
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(
        `https://healthfitnessbackend.onrender.com/api/get-leaderboard/${challenge.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaderboard(response.data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.post(
        "https://healthfitnessbackend.onrender.com/api/join-challenge",
        { challenge_id: challenge.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJoined(true);
      Alert.alert("✅ Success", "You have joined the challenge!");
    } catch (error) {
      Alert.alert("⚠️ Error", "Could not join the challenge.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{challenge.name}</Text>
      <Text style={styles.description}>{challenge.description}</Text>
      <Text style={styles.participants}>👥 {challenge.participants} Participants</Text>

      {!joined && (
        <TouchableOpacity style={styles.joinButton} onPress={joinChallenge}>
          <Text style={styles.joinButtonText}>Join Challenge</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.leaderboardTitle}>🏅 Leaderboard</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList 
          data={leaderboard}
          keyExtractor={(item) => item.user}
          renderItem={({ item, index }) => (
            <View style={styles.leaderboardItem}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <Text style={styles.username}>{item.user}</Text>
              <Text style={styles.progress}>{item.progress} pts</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  description: { fontSize: 16, color: "#666", marginBottom: 10 },
  participants: { fontSize: 16, fontWeight: "bold", color: "#007bff", marginBottom: 20 },
  joinButton: { backgroundColor: "#007bff", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 20 },
  joinButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  leaderboardTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  leaderboardItem: { flexDirection: "row", justifyContent: "space-between", padding: 12, borderBottomWidth: 1, borderColor: "#ddd" },
  rank: { fontSize: 16, fontWeight: "bold", color: "#333" },
  username: { fontSize: 16 },
  progress: { fontSize: 16, fontWeight: "bold", color: "#007bff" },
});

export default ChallengeDetailsScreen;
