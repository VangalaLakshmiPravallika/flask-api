import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userEmail = await AsyncStorage.getItem("userEmail");

      if (!token || !userEmail) {
        throw new Error("User not authenticated");
      }

      const response = await axios.get("http://your-backend-url/api/get-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setUserData(response.data);
        await AsyncStorage.setItem("userProfile", JSON.stringify(response.data));
      } else {
        throw new Error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileCard}>
          <Text style={styles.heading}>
            <MaterialIcons name="person" size={28} color="#4CAF50" /> User Profile
          </Text>

          {userData ? (
            <>
              <Text style={styles.label}>
                👤 <Text style={styles.text}>Name: {userData.name}</Text>
              </Text>
              <Text style={styles.label}>
                📅 <Text style={styles.text}>Age: {userData.age}</Text>
              </Text>
              <Text style={styles.label}>
                ⚖️ <Text style={styles.text}>Weight: {userData.weight} kg</Text>
              </Text>
              <Text style={styles.label}>
                📏 <Text style={styles.text}>Height: {userData.height} cm</Text>
              </Text>
              <Text style={styles.label}>
                🧬 <Text style={styles.text}>Gender: {userData.gender}</Text>
              </Text>
              <Text style={styles.label}>
                📊 <Text style={styles.text}>BMI: {userData.bmi?.toFixed(2) || "N/A"}</Text>
              </Text>
            </>
          ) : (
            <Text style={styles.noData}>No details available. Please add your details.</Text>
          )}

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <MaterialIcons name="edit" size={20} color="#fff" />
            <Text style={styles.buttonText}> Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD", 
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  profileCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, 
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    color: "#333",
    marginBottom: 10,
  },
  text: {
    fontWeight: "bold",
    color: "#1976D2",
  },
  noData: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginBottom: 20,
  },
  editButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50", 
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default ProfileScreen;