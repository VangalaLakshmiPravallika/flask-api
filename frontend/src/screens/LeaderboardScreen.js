import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView, TouchableOpacity 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const { challengeId } = route.params;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const response = await axios.get(
          `https://healthfitnessbackend.onrender.com/api/get-leaderboard/${challengeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLeaderboard(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [challengeId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loading} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <FlatList
            data={leaderboard}
            keyExtractor={(item) => item.user}
            renderItem={({ item, index }) => (
              <View style={[styles.leaderboardItem, index === 0 ? styles.firstPlace : null]}>
                <Text style={styles.rank}>#{index + 1}</Text>
                <Text style={styles.username}>{item.user}</Text>
                <Text style={styles.points}>{item.points} pts</Text>
              </View>
            )}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f2f5" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff", elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10, color: "#333" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContainer: { paddingBottom: 20 },
  leaderboardItem: { flexDirection: "row", justifyContent: "space-between", padding: 12, marginVertical: 4, backgroundColor: "#fff", borderRadius: 8, elevation: 3 },
  firstPlace: { backgroundColor: "#ffd700" },
  rank: { fontSize: 18, fontWeight: "bold", color: "#007bff" },
  username: { fontSize: 16, fontWeight: "bold", color: "#333" },
  points: { fontSize: 16, color: "#555" }
});

export default LeaderboardScreen;
