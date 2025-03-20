import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ChallengesScreen = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get("https://healthfitnessbackend.onrender.com/api/get-challenges", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChallenges(response.data);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate("ChallengeDetails", { challenge: item })}
    >
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.participants}>👥 {item.participants} Participants</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🏆 Challenges</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList 
          data={challenges}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  card: { 
    backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  title: { fontSize: 18, fontWeight: "bold" },
  description: { fontSize: 14, color: "#666", marginVertical: 5 },
  participants: { fontSize: 14, fontWeight: "bold", color: "#007bff" },
});

export default ChallengesScreen;
