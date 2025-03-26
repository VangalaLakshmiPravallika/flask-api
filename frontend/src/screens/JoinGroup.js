import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, Alert, TouchableOpacity, ActivityIndicator, StyleSheet, 
  ImageBackground, SafeAreaView, StatusBar, Modal, TextInput
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const JoinGroup = () => {
  const [groups, setGroups] = useState([]); 
  const [userGroups, setUserGroups] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupToDelete, setGroupToDelete] = useState("");
  const [selectedGroupDetails, setSelectedGroupDetails] = useState(null);
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
      Alert.alert("⚠ Error", "Failed to load groups.");
    }
  };

  const fetchUserGroups = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠ Login Required", "Please log in.");
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
        Alert.alert("⚠ Login Required", "Please log in.");
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
      Alert.alert("⚠ Error", error.response?.data?.error || "Could not join group");
    }
  };

  const leaveGroup = async (groupName) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠ Login Required", "Please log in.");
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
      Alert.alert("⚠ Error", error.response?.data?.error || "Could not leave group");
    }
  };

  const createGroup = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠ Login Required", "Please log in.");
        return;
      }

      const response = await axios.post(
        "https://healthfitnessbackend.onrender.com/api/create-group",
        { group_name: newGroupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("✅ Success", response.data.message);
      setGroups([...groups, { name: newGroupName }]);
      setIsCreateModalVisible(false);
      setNewGroupName("");
    } catch (error) {
      console.error("Error creating group:", error.response?.data);
      Alert.alert("⚠ Error", error.response?.data?.error || "Could not create group");
    }
  };

  const deleteGroup = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠ Login Required", "Please log in.");
        return;
      }

      const response = await axios.post(
        "https://healthfitnessbackend.onrender.com/api/delete-group",
        { group_name: groupToDelete },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("✅ Success", response.data.message);
      setGroups(groups.filter(group => group.name !== groupToDelete));
      setIsDeleteModalVisible(false);
      setGroupToDelete("");
    } catch (error) {
      console.error("Error deleting group:", error.response?.data);
      Alert.alert("⚠ Error", error.response?.data?.error || "Could not delete group");
    }
  };

  const fetchGroupDetails = async (groupName) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠ Login Required", "Please log in.");
        return;
      }

      const response = await axios.get(
        `https://healthfitnessbackend.onrender.com/api/get-group-details/${groupName}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedGroupDetails(response.data);
      setIsDetailsModalVisible(true);
    } catch (error) {
      console.error("Error fetching group details:", error.response?.data);
      Alert.alert("⚠ Error", error.response?.data?.error || "Could not fetch group details");
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
              onPress={() => setIsCreateModalVisible(true)}
            >
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.createGroupButtonText}> Create Group</Text>
              </LinearGradient>
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
                      <View style={styles.memberCount}>
                        <Ionicons name="people-outline" size={16} color={userGroups.includes(item.name) ? "white" : "#7F8C8D"} />
                        <Text style={[styles.groupMembers, userGroups.includes(item.name) && styles.joinedGroupMembers]}>
                          {Math.floor(Math.random() * 100) + 5}
                        </Text>
                      </View>
                    </View>
                    
                    {!userGroups.includes(item.name) ? (
                      <TouchableOpacity
                        style={styles.joinButton}
                        onPress={() => joinGroup(item.name)}
                      >
                        <LinearGradient
                          colors={['#3498DB', '#2980B9']}
                          style={styles.gradientButton}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <MaterialIcons name="group-add" size={20} color="white" />
                          <Text style={styles.buttonText}> Join Community</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.postButton}
                          onPress={() => navigation.navigate("PostAchievement", { group: item.name })}
                        >
                          <LinearGradient
                            colors={['#9b59b6', '#8e44ad']}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          >
                            <Ionicons name="megaphone-outline" size={18} color="white" />
                            <Text style={styles.postButtonText}> Share Achievement</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        <View style={styles.buttonRow}>
                          <TouchableOpacity
                            style={styles.detailsButton}
                            onPress={() => fetchGroupDetails(item.name)}
                          >
                            <LinearGradient
                              colors={['#FFA500', '#FF8C00']}
                              style={styles.gradientButton}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                            >
                              <Ionicons name="information-circle-outline" size={18} color="white" />
                              <Text style={styles.detailsButtonText}> Details</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.leaveButton}
                            onPress={() => leaveGroup(item.name)}
                          >
                            <LinearGradient
                              colors={['#FF5252', '#D32F2F']}
                              style={styles.gradientButton}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                            >
                              <MaterialIcons name="exit-to-app" size={18} color="white" />
                              <Text style={styles.leaveButtonText}> Leave</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                        {userGroups.includes(item.name) && (
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => {
                              setGroupToDelete(item.name);
                              setIsDeleteModalVisible(true);
                            }}
                          >
                            <LinearGradient
                              colors={['#FF4500', '#D84315']}
                              style={styles.gradientButton}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                            >
                              <MaterialIcons name="delete-outline" size={18} color="white" />
                              <Text style={styles.deleteButtonText}> Delete Group</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        )}
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
        visible={isCreateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create a New Group</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter group name"
              placeholderTextColor="#999"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsCreateModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={createGroup}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for Deleting a Group */}
      <Modal
        visible={isDeleteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Group</Text>
            <Text style={styles.modalText}>Are you sure you want to delete the group "{groupToDelete}"?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteConfirmButton]}
                onPress={deleteGroup}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for Viewing Group Details */}
      <Modal
        visible={isDetailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Group Details</Text>
            {selectedGroupDetails && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Ionicons name="people-outline" size={20} color="#3a7bd5" />
                  <Text style={styles.detailText}>{selectedGroupDetails.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={20} color="#3a7bd5" />
                  <Text style={styles.detailText}>Members: {selectedGroupDetails.members.length}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="document-text-outline" size={20} color="#3a7bd5" />
                  <Text style={styles.detailText}>Posts: {selectedGroupDetails.posts.length}</Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={() => setIsDetailsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
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
    marginBottom: 20,
  },
  createGroupButton: {
    width: '60%',
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 10,
    elevation: 5,
  },
  gradientButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  createGroupButtonText: {
    color: "white",
    fontWeight: "600",
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
    paddingBottom: 30,
  },
  groupContainer: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  groupGradient: {
    padding: 20,
    borderRadius: 16,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    flex: 1,
  },
  joinedGroupName: {
    color: "#FFFFFF",
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupMembers: {
    fontSize: 14,
    color: "#7F8C8D",
    marginLeft: 5,
  },
  joinedGroupMembers: {
    color: "rgba(255,255,255,0.8)",
  },
  joinButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: "column",
    gap: 10,
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  postButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  postButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  leaveButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  leaveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  detailsButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  detailsButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  deleteButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    padding: 25,
    borderRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2C3E50",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: "center",
    color: "#555",
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 25,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  deleteConfirmButton: {
    backgroundColor: '#FF5252',
  },
  closeButton: {
    backgroundColor: '#3a7bd5',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  detailsContainer: {
    marginBottom: 25,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#555',
  },
});

export default JoinGroup;