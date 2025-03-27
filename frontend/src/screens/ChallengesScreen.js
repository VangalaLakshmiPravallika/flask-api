import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, 
  SafeAreaView, StatusBar, Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get('window');
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <View style={styles.challengeCard}>
              <Text style={styles.challengeTitle}>{item.name}</Text>
              <Text style={styles.challengeDescription}>{item.description}</Text>
              <TouchableOpacity 
                style={[styles.button, joining && styles.buttonDisabled]} 
                onPress={() => joinChallenge(item.name)} 
                disabled={joining}
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.buttonText}>Join Challenge</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="sad-outline" size={48} color="rgba(255,255,255,0.7)" />
              <Text style={styles.emptyText}>No challenges available</Text>
            </View>
          }
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : (
        <FlatList
          data={joinedChallenges}
          keyExtractor={(item) => item.challenge_name}
          renderItem={({ item }) => (
            <View style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>{item.challenge_name}</Text>
                {item.progress > 0 && (
                  <View style={styles.progressBadge}>
                    <Text style={styles.progressText}>{item.progress}%</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.actionButtonContainer}>
                <TouchableOpacity style={styles.buttonGreen} onPress={() => updateProgress(item.challenge_name)}>
                  <Ionicons name="trending-up" size={18} color="white" />
                  <Text style={styles.buttonText}>Progress</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.buttonOrange} onPress={() => resetProgress(item.challenge_name)}>
                  <Ionicons name="refresh" size={18} color="white" />
                  <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.buttonBlue} onPress={() => viewLeaderboard(item.challenge_name)}>
                  <Ionicons name="trophy" size={18} color="white" />
                  <Text style={styles.buttonText}>Leaderboard</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.buttonRed} onPress={() => leaveChallenge(item.challenge_name)}>
                  <Ionicons name="close-circle" size={18} color="white" />
                  <Text style={styles.buttonText}>Leave</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="sad-outline" size={48} color="rgba(255,255,255,0.7)" />
              <Text style={styles.emptyText}>You haven't joined any challenges yet</Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
};

const ChallengesScreen = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#764ba2' }}>
    <StatusBar barStyle="light-content" />
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold', textTransform: 'none' },
        tabBarStyle: { backgroundColor: 'transparent', elevation: 0 },
        tabBarIndicatorStyle: { backgroundColor: 'white', height: 3 },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.7)',
      }}
    >
      <Tab.Screen name="Available" component={AvailableChallenges} />
      <Tab.Screen name="My Challenges" component={JoinedChallenges} />
    </Tab.Navigator>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center'
  },
  challengeCard: { 
    padding: 20, 
    borderRadius: 12, 
    backgroundColor: "rgba(255,255,255,0.1)", 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  challengeTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "white",
    flex: 1
  },
  challengeDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
    lineHeight: 20
  },
  progressBadge: {
    backgroundColor: '#28A745',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 10
  },
  progressText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  },
  actionButtonContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    flexWrap: 'wrap',
    marginTop: 8
  },
  button: { 
    backgroundColor: "#5C67F2", 
    padding: 12,
    borderRadius: 8, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
    width: '100%'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonGreen: { 
    backgroundColor: "#28A745", 
    padding: 10, 
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.22,
    marginBottom: 8
  },
  buttonOrange: { 
    backgroundColor: "#FF9500", 
    padding: 10, 
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.22,
    marginBottom: 8
  },
  buttonBlue: { 
    backgroundColor: "#007AFF", 
    padding: 10, 
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.22,
    marginBottom: 8
  },
  buttonRed: { 
    backgroundColor: "#FF3B30", 
    padding: 10, 
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.22,
    marginBottom: 8
  },
  buttonText: { 
    color: "white", 
    marginLeft: 6, 
    fontWeight: "bold",
    fontSize: 12
  },
  listContainer: {
    paddingBottom: 20
  }
});

export default ChallengesScreen;