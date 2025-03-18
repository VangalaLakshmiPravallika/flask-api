import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get("https://healthfitnessbackend.onrender.com/api/get-notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      Alert.alert("⚠️ Error", "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f9f9f9" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>Notifications</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => `notif-${index}`}
          renderItem={({ item }) => (
            <View style={{ padding: 10, backgroundColor: "#fff", marginBottom: 8, borderRadius: 6 }}>
              <Text style={{ fontSize: 16 }}>{item.message}</Text>
              <Text style={{ fontSize: 12, color: "#666" }}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;
