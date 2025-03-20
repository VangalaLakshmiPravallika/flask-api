import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, Alert, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet, 
  ImageBackground, SafeAreaView, StatusBar, Modal
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const JoinGroup = () => {
  const [groups, setGroups] = useState([]); 
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
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
      setUserGroups([]); 
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert("⚠️ Error", "Group name cannot be empty.");
      return;
    }

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
      setNewGroupName("");
      setModalVisible(false);
    } catch (error) {
      Alert.alert("⚠️ Error", error.response?.data?.error || "Could not create group");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={{ uri: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5" }}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Fitness Communities</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.createButtonText}>➕ Create Group</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <FlatList
              data={groups}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <View style={styles.groupContainer}>
                  <Text style={styles.groupName}>{item.name}</Text>
                </View>
              )}
            />
          )}
        </View>
      </ImageBackground>

      {/* Modal for creating group */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create a New Group</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter group name"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <TouchableOpacity style={styles.createButton} onPress={createGroup}>
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#040F2D" },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, padding: 20 },
  title: { fontSize: 24, color: "#FFF", textAlign: "center", marginBottom: 20 },
  createButton: { backgroundColor: "#3498DB", padding: 10, borderRadius: 10, alignItems: "center", marginBottom: 20 },
  createButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  groupContainer: { backgroundColor: "#FFF", padding: 15, borderRadius: 10, marginBottom: 10 },
  groupName: { fontSize: 18, fontWeight: "bold" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 10 },
  cancelButton: { color: "#E74C3C", marginTop: 10 }
});

export default JoinGroup;