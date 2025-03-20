import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, Alert, Modal 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const ChallengesScreen = () => {
  const [challenges, setChallenges] = useState([]);
  const [newChallenge, setNewChallenge] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, []);

  // ✅ Load challenges from storage
  const loadChallenges = async () => {
    try {
      const storedChallenges = await AsyncStorage.getItem("challenges");
      if (storedChallenges) {
        setChallenges(JSON.parse(storedChallenges));
      } else {
        const defaultChallenges = [
          { id: "1", title: "🏃 10,000 Steps Daily", progress: 0 },
          { id: "2", title: "💧 Drink 3L Water Daily", progress: 0 },
          { id: "3", title: "🏋️ Workout 5 Days a Week", progress: 0 },
          { id: "4", title: "🍎 Eat 5 Servings of Fruits/Veggies", progress: 0 },
          { id: "5", title: "🛌 Sleep 8 Hours Daily", progress: 0 }
        ];
        await AsyncStorage.setItem("challenges", JSON.stringify(defaultChallenges));
        setChallenges(defaultChallenges);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load challenges.");
    }
  };

  // ✅ Add a new challenge
  const addChallenge = async () => {
    if (!newChallenge.trim()) {
      Alert.alert("Error", "Challenge title cannot be empty.");
      return;
    }
    const updatedChallenges = [
      ...challenges, 
      { id: String(challenges.length + 1), title: newChallenge, progress: 0 }
    ];
    setChallenges(updatedChallenges);
    await AsyncStorage.setItem("challenges", JSON.stringify(updatedChallenges));
    setNewChallenge("");
    setModalVisible(false);
  };

  // ✅ Update progress
  const updateProgress = async (id) => {
    const updatedChallenges = challenges.map(challenge =>
      challenge.id === id ? { ...challenge, progress: Math.min(challenge.progress + 10, 100) } : challenge
    );
    setChallenges(updatedChallenges);
    await AsyncStorage.setItem("challenges", JSON.stringify(updatedChallenges));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Fitness Challenges</Text>

      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.challengeText}>{item.title}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{item.progress}% Completed</Text>
            <TouchableOpacity 
              style={styles.joinButton} 
              onPress={() => updateProgress(item.id)}
            >
              <Text style={styles.buttonText}>✅ Update Progress</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* ✅ Add Challenge Button */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add-circle" size={50} color="#007bff" />
      </TouchableOpacity>

      {/* ✅ Add Challenge Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Challenge</Text>
            <TextInput
              placeholder="Enter Challenge Title"
              style={styles.input}
              value={newChallenge}
              onChangeText={setNewChallenge}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={addChallenge}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  card: { backgroundColor: "#fff", padding: 16, marginBottom: 12, borderRadius: 10, elevation: 3 },
  challengeText: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  progressBar: { height: 10, backgroundColor: "#ddd", borderRadius: 5, overflow: "hidden", marginVertical: 8 },
  progressFill: { height: "100%", backgroundColor: "#007bff" },
  progressText: { fontSize: 14, color: "#555", textAlign: "center", marginBottom: 8 },
  joinButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  
  // ✅ Add Challenge Button
  addButton: { position: "absolute", bottom: 20, right: 20 },
  
  // ✅ Modal Styles
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  modalButton: { flex: 1, padding: 10, alignItems: "center", marginHorizontal: 5, backgroundColor: "#007bff", borderRadius: 8 },
  modalButtonText: { color: "#fff", fontWeight: "bold" },
});

export default ChallengesScreen;
