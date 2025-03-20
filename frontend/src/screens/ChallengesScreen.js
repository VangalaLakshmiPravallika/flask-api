import React, { useEffect, useState } from "react";
import { 
  View, Text, TouchableOpacity, FlatList, Alert, TextInput, Modal, StyleSheet, ActivityIndicator, ScrollView 
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const API_URL = "https://healthfitnessbackend.onrender.com/api"; L

const ChallengesScreen = () => {
  const [challenges, setChallenges] = useState([]);
  const [joinedChallenges, setJoinedChallenges] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [progress, setProgress] = useState({});
  const [newChallenge, setNewChallenge] = useState({ name: "", description: "", duration_days: "" });
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/get-challenges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChallenges(response.data.challenges);
    } catch (error) {
      Alert.alert("Error", "Failed to load challenges.");
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeName) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.post(`${API_URL}/join-challenge`, { challenge_name: challengeName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJoinedChallenges((prev) => ({ ...prev, [challengeName]: true }));
      Alert.alert("Success", `Joined '${challengeName}' challenge!`);
    } catch (error) {
      Alert.alert("Error", "Failed to join challenge.");
    }
  };

  const updateProgress = async (challengeName) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.post(`${API_URL}/update-challenge-progress`, { challenge_name: challengeName, progress: 1 }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress((prev) => ({ ...prev, [challengeName]: (prev[challengeName] || 0) + 1 }));
      Alert.alert("Progress Updated!", `Your progress for '${challengeName}' has been updated.`);
    } catch (error) {
      Alert.alert("Error", "Failed to update progress.");
    }
  };

  const resetProgress = async (challengeName) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.post(`${API_URL}/reset-challenge-progress`, { challenge_name: challengeName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress((prev) => ({ ...prev, [challengeName]: 0 }));
      Alert.alert("Progress Reset", `Your progress for '${challengeName}' has been reset.`);
    } catch (error) {
      Alert.alert("Error", "Failed to reset progress.");
    }
  };

  const fetchLeaderboard = async (challengeName) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/leaderboard/${challengeName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedChallenge({ name: challengeName, leaderboard: response.data.leaderboard });
    } catch (error) {
      Alert.alert("Error", "Failed to load leaderboard.");
    }
  };

  const addChallenge = async () => {
    if (!newChallenge.name || !newChallenge.description || !newChallenge.duration_days) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.post(`${API_URL}/add-challenge`, newChallenge, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalVisible(false);
      fetchChallenges();
      Alert.alert("Success", "Challenge created successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to create challenge.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Challenges</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <FlatList
            data={challenges}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View style={styles.challengeCard}>
                <Text style={styles.challengeName}>{item.name}</Text>
                <Text style={styles.challengeDescription}>{item.description}</Text>
                <Text style={styles.challengeDuration}>Duration: {item.duration_days} days</Text>

                {!joinedChallenges[item.name] ? (
                  <TouchableOpacity style={styles.joinButton} onPress={() => joinChallenge(item.name)}>
                    <Text style={styles.buttonText}>Join Challenge</Text>
                  </TouchableOpacity>
                ) : (
                  <View>
                    <TouchableOpacity style={styles.progressButton} onPress={() => updateProgress(item.name)}>
                      <Text style={styles.buttonText}>Update Progress</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.resetButton} onPress={() => resetProgress(item.name)}>
                      <Text style={styles.buttonText}>Reset Progress</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.leaderboardButton} onPress={() => fetchLeaderboard(item.name)}>
                      <Text style={styles.buttonText}>View Leaderboard</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
        )}

        {/* Add New Challenge Button */}
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={30} color="#fff" />
          <Text style={styles.addButtonText}>Add Challenge</Text>
        </TouchableOpacity>

        {/* Leaderboard Modal */}
        {selectedChallenge && (
          <Modal animationType="slide" visible={true} onRequestClose={() => setSelectedChallenge(null)}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{selectedChallenge.name} Leaderboard</Text>
              <FlatList
                data={selectedChallenge.leaderboard}
                keyExtractor={(item) => item.user}
                renderItem={({ item, index }) => (
                  <Text style={styles.leaderboardItem}>{index + 1}. {item.user} - {item.progress} days</Text>
                )}
              />
              <TouchableOpacity onPress={() => setSelectedChallenge(null)}>
                <Text style={styles.closeModal}>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f2f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  challengeCard: { backgroundColor: "#fff", padding: 15, marginBottom: 10, borderRadius: 8 },
  challengeName: { fontSize: 18, fontWeight: "bold" },
  challengeDescription: { fontSize: 14, color: "#555" },
  challengeDuration: { fontSize: 12, color: "#777" },
  joinButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 5, marginTop: 5 },
  progressButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 5, marginTop: 5 },
  resetButton: { backgroundColor: "#dc3545", padding: 10, borderRadius: 5, marginTop: 5 },
  leaderboardButton: { backgroundColor: "#17a2b8", padding: 10, borderRadius: 5, marginTop: 5 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});

export default ChallengesScreen;
