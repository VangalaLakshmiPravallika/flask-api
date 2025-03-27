import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, SafeAreaView, StatusBar
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

const API_URL = "https://healthfitnessbackend.onrender.com/api";
const Tab = createMaterialTopTabNavigator();

const AvailableChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

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
      setChallenges(response.data.challenges || []);
    } catch (error) {
      Alert.alert("Error", "Failed to load challenges.");
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeName) => {
    try {
      setJoining(true);
      const token = await AsyncStorage.getItem("authToken");
      await axios.post(`${API_URL}/join-challenge`, { challenge_name: challengeName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("🎉 Success", `You have joined "${challengeName}"`);
    } catch (error) {
      Alert.alert("⚠ Error", "Failed to join challenge.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="white" />
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <View style={styles.challengeCard}>
              <Text style={styles.challengeTitle}>{item.name}</Text>
              <Text style={styles.challengeDescription}>{item.description}</Text>
              <TouchableOpacity style={styles.button} onPress={() => joinChallenge(item.name)} disabled={joining}>
                <Ionicons name="add-circle" size={24} color="white" />
                <Text style={styles.buttonText}>Join Challenge</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </LinearGradient>
  );
};

const JoinedChallenges = () => {
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchJoinedChallenges();
  }, []);

  const fetchJoinedChallenges = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/get-user-challenges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJoinedChallenges(response.data.challenges || []);
    } catch (error) {
      Alert.alert("Error", "Failed to load joined challenges.");
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (challengeName) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.post(`${API_URL}/update-challenge-progress`, { challenge_name: challengeName, progress: 1 }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("✅ Progress Updated", "Your progress has been recorded!");
      fetchJoinedChallenges();
    } catch (error) {
      Alert.alert("⚠ Error", "Failed to update progress.");
    }
  };

  const resetProgress = async (challengeName) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.post(`${API_URL}/reset-challenge-progress`, { challenge_name: challengeName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("🔄 Progress Reset", `Progress reset for "${challengeName}"`);
      fetchJoinedChallenges();
    } catch (error) {
      Alert.alert("⚠ Error", "Failed to reset progress.");
    }
  };

  const leaveChallenge = async (challengeName) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.post(`${API_URL}/leave-challenge`, { challenge_name: challengeName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("🚪 Left Challenge", `You left "${challengeName}"`);
      fetchJoinedChallenges();
    } catch (error) {
      Alert.alert("⚠ Error", "Failed to leave challenge.");
    }
  };

  const viewLeaderboard = (challengeName) => {
    navigation.navigate("Leaderboard", { challengeName });
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="white" />
      ) : (
        <FlatList
          data={joinedChallenges}
          keyExtractor={(item) => item.challenge_name}
          renderItem={({ item }) => (
            <View style={styles.challengeCard}>
              <Text style={styles.challengeTitle}>{item.challenge_name}</Text>
              <View style={styles.actionButtonContainer}>
                <TouchableOpacity style={styles.buttonGreen} onPress={() => updateProgress(item.challenge_name)}>
                  <Ionicons name="trending-up" size={20} color="white" />
                  <Text style={styles.buttonText}>Progress</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonOrange} onPress={() => resetProgress(item.challenge_name)}>
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonBlue} onPress={() => viewLeaderboard(item.challenge_name)}>
                  <Ionicons name="trophy" size={20} color="white" />
                  <Text style={styles.buttonText}>Leaderboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonRed} onPress={() => leaveChallenge(item.challenge_name)}>
                  <Ionicons name="close-circle" size={20} color="white" />
                  <Text style={styles.buttonText}>Leave</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </LinearGradient>
  );
};

const ChallengesScreen = () => (
  <SafeAreaView style={{ flex: 1 }}>
    <Tab.Navigator>
      <Tab.Screen name="Available Challenges" component={AvailableChallenges} />
      <Tab.Screen name="Joined Challenges" component={JoinedChallenges} />
    </Tab.Navigator>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  challengeCard: { padding: 20, borderRadius: 10, backgroundColor: "#444", marginBottom: 10 },
  challengeTitle: { fontSize: 18, fontWeight: "bold", color: "white" },
  actionButtonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  button: { backgroundColor: "#5C67F2", padding: 10, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 5 },
  buttonGreen: { backgroundColor: "#28A745", padding: 10, borderRadius: 10 },
  buttonOrange: { backgroundColor: "#FFA500", padding: 10, borderRadius: 10 },
  buttonBlue: { backgroundColor: "#007BFF", padding: 10, borderRadius: 10 },
  buttonRed: { backgroundColor: "#DC3545", padding: 10, borderRadius: 10 },
  buttonText: { color: "white", marginLeft: 5, fontWeight: "bold" },
});

export default ChallengesScreen;
