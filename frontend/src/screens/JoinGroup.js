import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, Alert, TouchableOpacity, ActivityIndicator, StyleSheet, 
  ImageBackground, SafeAreaView, StatusBar, Modal, TextInput, Button
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const JoinGroup = () => {
  const [groups, setGroups] = useState([]); 
  const [userGroups, setUserGroups] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
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

  const createGroup = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠️ Login Required", "Please log in.");
        return;
      }

      const response = await axios.post(
        "https://healthfitnessbackend.onrender.com/api/create-group",
        { group_name: newGroupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("✅ Success", response.data.message);
      setGroups([...groups, { name: newGroupName }]);
      setIsModalVisible(false);
      setNewGroupName("");
    } catch (error) {
      console.error("Error creating group:", error.response?.data);
      Alert.alert("⚠️ Error", error.response?.data?.error || "Could not create group");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={{ uri: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80" }}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.overlay}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Fitness Communities</Text>
            <Text style={styles.subtitle}>Join groups to share your journey</Text>
            <TouchableOpacity
              style={styles.createGroupButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Text style={styles.createGroupButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Loading communities...</Text>
            </View>
          ) : (
            <FlatList
              data={groups}
              keyExtractor={(item) => item.name}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.groupContainer}>
                  <LinearGradient
                    colors={userGroups.includes(item.name) ? ['#3a7bd5', '#00d2ff'] : ['#f5f7fa', '#c3cfe2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.groupGradient}
                  >
                    <View style={styles.groupHeader}>
                      <Text style={[styles.groupName, userGroups.includes(item.name) && styles.joinedGroupName]}>
                        {userGroups.includes(item.name) ? `${item.name} ✓` : item.name}
                      </Text>
                      <Text style={styles.groupMembers}>{Math.floor(Math.random() * 100) + 5} members</Text>
                    </View>
                    
                    {!userGroups.includes(item.name) ? (
                      <TouchableOpacity
                        style={styles.joinButton}
                        onPress={() => joinGroup(item.name)}
                      >
                        <Text style={styles.buttonText}>Join Community</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.postButton}
                          onPress={() => navigation.navigate("PostAchievement", { group: item.name })}
                        >
                          <Text style={styles.postButtonText}>📢 Share Achievement</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.leaveButton}
                          onPress={() => leaveGroup(item.name)}
                        >
                          <Text style={styles.leaveButtonText}>Leave</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </LinearGradient>
                </View>
              )}
            />
          )}
        </View>
      </ImageBackground>

      {/* Modal for Creating a Group */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create a New Group</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter group name"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <Button title="Create" onPress={createGroup} />
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#040F2D",
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(4, 15, 45, 0.85)",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#B8C6DB",
    textAlign: "center",
    marginBottom: 10,
  },
  createGroupButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  createGroupButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    color: "#FFFFFF",
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
  groupContainer: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupGradient: {
    padding: 20,
    borderRadius: 16,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    flex: 1,
  },
  joinedGroupName: {
    color: "#FFFFFF",
  },
  groupMembers: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  joinButton: {
    backgroundColor: "#3498DB",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: "column",
    gap: 10,
  },
  postButton: {
    backgroundColor: "#9b59b6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  leaveButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    alignItems: "center",
  },
  leaveButtonText: {
    color: "white",
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});

export default JoinGroup;