import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem("userProfile");
      if (data) {
        const userData = JSON.parse(data);
        setName(userData.name);
        setAge(userData.age.toString());
        setGender(userData.gender);
        setHeight(userData.height.toString());
        setWeight(userData.weight.toString());
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleSave = async () => {
    const token = await AsyncStorage.getItem("authToken"); // Corrected key
    const profileData = {
      name,
      age,
      gender,
      height,
      weight,
    };

    try {
      const response = await axios.put(
        "https://healthfitnessbackend.onrender.com/api/edit-profile",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update local profile data
        const updatedProfile = { ...profileData, bmi: calculateBMI(weight, height) };
        await AsyncStorage.setItem("userProfile", JSON.stringify(updatedProfile));

        Alert.alert("Success", "Profile updated successfully");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        Alert.alert("Error", `Server error: ${error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        Alert.alert("Error", "No response from the server. Please check your internet connection.");
      } else {
        // Something happened in setting up the request
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    }
  };

  // Helper function to calculate BMI
  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileCard}>
          <Text style={styles.heading}>
            <MaterialIcons name="edit" size={28} color="#4CAF50" /> Edit Profile
          </Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Enter your age"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={styles.input}
            value={gender}
            onChangeText={setGender}
            placeholder="Enter your gender"
          />

          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="Enter your height"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter your weight"
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <MaterialIcons name="save" size={20} color="#fff" />
            <Text style={styles.buttonText}> Save Changes</Text>
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
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  saveButton: {
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

export default EditProfileScreen;