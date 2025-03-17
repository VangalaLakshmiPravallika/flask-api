import React, { useEffect, useState } from "react";
import { 
  View, Text, Button, FlatList, Alert, TouchableOpacity, ActivityIndicator, StyleSheet 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const JoinGroup = () => {
  const [groups, setGroups] = useState([]); 
  const [userGroups, setUserGroups] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchGroups();
    fetchUserGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get("https://healthfitnessbackend.onrender.com/api/get-groups");
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      Alert.alert("⚠️ Error", "Failed to load groups.");
    }
  };

  const fetchUserGroups = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠️ Login Required", "Please log in.");
        return;
      }

      const response = await axios.get(
        "https://healthfitnessbackend.onrender.com/api/get-user-groups",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserGroups(response.data.groups || []);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      setUserGroups([]); 
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupName) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠️ Login Required", "Please log in.");
        return;
      }

      const response = await axios.post(
        "https://healthfitnessbackend.onrender.com/api/join-group",
        { group_name: groupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("✅ Success", response.data.message);
      setUserGroups([...userGroups, groupName]); 
    } catch (error) {
      console.error("Error joining group:", error.response?.data);
      Alert.alert("⚠️ Error", error.response?.data?.error || "Could not join group");
    }
  };

  const leaveGroup = async (groupName) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠️ Login Required", "Please log in.");
        return;
      }

      const response = await axios.post(
        "https://healthfitnessbackend.onrender.com/api/leave-group",
        { group_name: groupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("✅ Success", response.data.message);
      setUserGroups(userGroups.filter(group => group !== groupName));
    } catch (error) {
      console.error("Error leaving group:", error.response?.data);
      Alert.alert("⚠️ Error", error.response?.data?.error || "Could not leave group");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌟 Join a Group 🌟</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FF5722" />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ paddingBottom: 50 }}
          renderItem={({ item }) => (
            <View style={styles.groupContainer}>
              <Text style={styles.groupName}>{item.name}</Text>
              {!userGroups.includes(item.name) ? (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => joinGroup(item.name)}
                >
                  <Text style={styles.buttonText}>Join</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.joinedButton}
                    onPress={() => leaveGroup(item.name)}
                  >
                    <Text style={styles.buttonText}>Leave ❌</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.postButton} 
                    onPress={() => navigation.navigate("PostAchievement", { group: item.name })}
                  >
                    <Text style={styles.postButtonText}>📢 Post Achievement</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#E3F2FD" 
  },
  title: { 
    fontSize: 26, 
    fontWeight: "bold", 
    color: "#1A237E", 
    textAlign: "center", 
    marginBottom: 15 
  },
  groupContainer: { 
    padding: 15, 
    backgroundColor: "#FFEBEE", 
    borderRadius: 12, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: "#D1D1E0",
    elevation: 5, 
  },
  groupName: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#880E4F"
  },
  joinButton: {
    backgroundColor: "#2196F3", 
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  joinedButton: {
    backgroundColor: "#F44336", 
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  postButton: {
    backgroundColor: "#9C27B0", 
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default JoinGroup;
