import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Modal, TextInput, Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const API_URL = "https://healthfitnessbackend.onrender.com/api";

const ChallengesScreen = () => {
  const navigation = useNavigation();
  const [challenges, setChallenges] = useState([]);
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newChallenge, setNewChallenge] = useState({ name: "", description: "", target: "", unit: "" });

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  /** ✅ Check Token & Fetch Data */
  const checkAuthAndFetchData = async () => {
    const token = await AsyncStorage.getItem("authToken");

    if (!token) {
      Alert.alert("Session Expired", "Please log in again.");
      navigation.navigate("Login");
      return;
    }

    fetchChallenges();
    fetchJoinedChallenges();
  };

  /** ✅ Fetch All Challenges */
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/get-challenges`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChallenges(response.data.challenges || []);
    } catch (error) {
      handleAuthError(error, "Failed to load challenges.");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ Fetch Joined Challenges */
  const fetchJoinedChallenges = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/get-user-challenges`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJoinedChallenges(response.data.challenges || []);
    } catch (error) {
      handleAuthError(error, "Failed to load joined challenges.");
    }
  };

  /** ✅ Handle Auth Errors (Token Expired) */
  const handleAuthError = (error, defaultMessage) => {
    if (error.response?.data?.msg === "Token has expired") {
      Alert.alert("Session Expired", "Please log in again.");
      navigation.navigate("Login");
    } else {
      Alert.alert("Error", defaultMessage);
    }
  };

  /** ✅ Join a Challenge */
  const joinChallenge = async (challengeName) => {
    try {
      setJoining(true);
      const token = await AsyncStorage.getItem("authToken");

      await axios.post(`${API_URL}/join-challenge`, { challenge_name: challengeName }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("🎉 Success", `You have joined "${challengeName}"`);
      fetchJoinedChallenges();
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to join challenge.");
    } finally {
      setJoining(false);
    }
  };

  /** ✅ Update Progress */
  const updateProgress = async (challengeName) => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await axios.post(`${API_URL}/update-challenge-progress`,
        { challenge_name: challengeName, progress: 1 }, // ✅ Increment by 1
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("✅ Progress Updated", response.data.message);
      fetchJoinedChallenges();
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to update progress.");
    }
  };

  /** ✅ Reset Progress */
  const resetProgress = async (challengeName) => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      await axios.post(`${API_URL}/reset-challenge-progress`, { challenge_name: challengeName }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("🔄 Progress Reset", `Progress reset for "${challengeName}"`);
      fetchJoinedChallenges();
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to reset progress.");
    }
  };

  /** ✅ Fetch & View Leaderboard */
  const viewLeaderboard = async (challengeName) => {
    try {
      setLoadingLeaderboard(true);
      const token = await AsyncStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/get-leaderboard/${challengeName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigation.navigate("Leaderboard", { leaderboard: response.data.leaderboard });
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to load leaderboard.");
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  /** ✅ Add New Challenge */
  const addNewChallenge = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await axios.post(`${API_URL}/add-challenge`, newChallenge, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("🎉 Success", response.data.message);
      setModalVisible(false);
      fetchChallenges();
    } catch (error) {
      Alert.alert("⚠️ Error", error.response?.data?.error || "Failed to add challenge.");
    }
  };

  /** ✅ Render Challenge Item */
  const renderChallengeItem = ({ item }) => (
    <View style={styles.challengeCard}>
      <Text style={styles.challengeTitle}>{item.name}</Text>
      <Text style={styles.challengeDescription}>{item.description}</Text>
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => joinChallenge(item.name)}
        disabled={joining}
      >
        <Text style={styles.buttonText}>Join Challenge</Text>
      </TouchableOpacity>
    </View>
  );

  /** ✅ Render Joined Challenge Item */
  const renderJoinedChallengeItem = ({ item }) => (
    <View style={styles.challengeCard}>
      <Text style={styles.challengeTitle}>{item.challenge_name}</Text>

      <TouchableOpacity
        style={styles.progressButton}
        onPress={() => updateProgress(item.challenge_name)}
      >
        <Text style={styles.buttonText}>Update Progress</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => resetProgress(item.challenge_name)}
      >
        <Text style={styles.buttonText}>Reset Progress</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.leaderboardButton}
        onPress={() => viewLeaderboard(item.challenge_name)}
      >
        <Text style={styles.buttonText}>Leaderboard</Text>
      </TouchableOpacity>
    </View>
  );

  /** ✅ Render Section Header */
  const renderSectionHeader = (title) => (
    <Text style={styles.header}>{title}</Text>
  );

  /** ✅ Combined Data for FlatList */
  const combinedData = [
    { type: "header", title: "Challenges" },
    ...challenges.map((item) => ({ type: "challenge", ...item })),
    { type: "header", title: "Your Challenges" },
    ...joinedChallenges.map((item) => ({ type: "joinedChallenge", ...item })),
  ];

  /** ✅ Render Item for FlatList */
  const renderItem = ({ item }) => {
    if (item.type === "header") {
      return renderSectionHeader(item.title);
    } else if (item.type === "challenge") {
      return renderChallengeItem({ item });
    } else if (item.type === "joinedChallenge") {
      return renderJoinedChallengeItem({ item });
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={combinedData}
          keyExtractor={(item, index) => item.type + index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add New Challenge</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Challenge</Text>
            <TextInput
              style={styles.input}
              placeholder="Challenge Name"
              value={newChallenge.name}
              onChangeText={(text) => setNewChallenge({ ...newChallenge, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newChallenge.description}
              onChangeText={(text) => setNewChallenge({ ...newChallenge, description: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Target"
              value={newChallenge.target}
              onChangeText={(text) => setNewChallenge({ ...newChallenge, target: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Unit (e.g., steps, liters)"
              value={newChallenge.unit}
              onChangeText={(text) => setNewChallenge({ ...newChallenge, unit: text })}
            />
            <Button title="Add Challenge" onPress={addNewChallenge} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  challengeCard: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, elevation: 3 },
  challengeTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  challengeDescription: { fontSize: 14, color: "#666", marginVertical: 8 },
  joinButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 8, alignItems: "center" },
  progressButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 10 },
  resetButton: { backgroundColor: "#dc3545", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 10 },
  leaderboardButton: { backgroundColor: "#ffc107", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  noChallengeText: { textAlign: "center", color: "#666", marginTop: 20 },
  addButton: { backgroundColor: "#007bff", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 10 },
});

export default ChallengesScreen;