import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";

export default function ResetPasswordScreen({ route, navigation }) {
  const { email } = route.params;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    try {
      const response = await fetch("https://healthfitnessbackend.onrender.com/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Password reset failed");
      }

      Alert.alert("Success", "Password reset successfully!");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Error", error.message);
      console.error("Reset error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.emailText}>For: {email}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCapitalize="none"
      />
      
      <TouchableOpacity 
        style={[styles.button, (!password || !confirmPassword) && styles.disabledButton]}
        onPress={handleResetPassword}
        disabled={!password || !confirmPassword}
      >
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  emailText: {
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});