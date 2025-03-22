import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  StyleSheet, 
  ImageBackground, 
  Alert, 
  Dimensions, 
  ScrollView 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { height, width } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-250))[0];

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("authToken");
      setLoggedIn(!!token);
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: menuVisible ? 0 : -250,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [menuVisible]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    setLoggedIn(false);
    Alert.alert("✅ Logged out successfully!");
  };

  const handleNewsPress = async () => {
    try {
      const response = await fetch("https://healthfitnessbackend.onrender.com/api/news");
      const newsData = await response.json();
      navigation.navigate("News", { news: newsData });
    } catch (error) {
      console.error("Error fetching news:", error);
      Alert.alert("Error", "Failed to fetch news. Please try again later.");
    }
  };

  return (
    <ImageBackground
      source={{ uri: "https://img.freepik.com/free-photo/top-view-yoga-essential-items_23-2149458975.jpg?t=st=1740846870~exp=1740850470~hmac=5c2f451381c50cb6bb7460cf79b7d4bedfde292cc52bcc04092ee3ce7ba4c0e6&w=740" }}
      style={styles.container}
    >
      {/* Hamburger Button */}
      <TouchableOpacity 
        style={styles.hamburgerButton} 
        onPress={() => setMenuVisible(!menuVisible)}
      >
        <Ionicons name="menu" size={40} color="#fff" />
      </TouchableOpacity>

      {/* Animated Sidebar Menu */}
      <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => setMenuVisible(false)}>
          <Ionicons name="close" size={30} color="#fff" />
        </TouchableOpacity>

        {/* ✅ Scrollable Menu Items */}
        <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
          {[
            "SleepTracker", "Achievements", "JoinGroup", "MealTracker", "FitnessAssessment", 
            "WorkoutPlan", "ProgressTracker", "StepCounter", "StepHistory", 
            "ChatBot", "Challenges"
          ].map((screen, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem} 
              onPress={() => { 
                setMenuVisible(false); 
                navigation.navigate(screen);
              }}
            >
              <Text style={styles.menuText}>{screen.replace(/([A-Z])/g, " $1").trim()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>Fit-Folks</Text>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton} onPress={handleNewsPress}>
          <Ionicons name="newspaper" size={24} color="#fff" />
          <Text style={styles.navText}>News</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person" size={24} color="#fff" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={loggedIn ? handleLogout : () => navigation.navigate("Login")}>
          <Ionicons name={loggedIn ? "log-out" : "log-in"} size={24} color="#fff" />
          <Text style={styles.navText}>{loggedIn ? "Logout" : "Login"}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "rgba(0, 0, 0, 0.4)" },
  hamburgerButton: { position: "absolute", top: 20, left: 20, padding: 10, backgroundColor: "#e0e0e0", borderRadius: 30, elevation: 5 },
  menuContainer: { 
    position: "absolute", top: 0, left: 0, height: height, width: 250, 
    backgroundColor: "#B8860B", paddingTop: 60, paddingLeft: 20, zIndex: 1 
  },
  closeButton: { position: "absolute", top: 10, right: 10, padding: 5 },
  menuScroll: { flexGrow: 1, paddingBottom: 40 },
  menuItem: { paddingVertical: 15 },
  menuText: { fontSize: 18, color: "#fff", fontWeight: "bold" },
  mainContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { 
    fontSize: 32, fontWeight: "bold", marginBottom: 30, color: "#FFD700", 
    textAlign: "center", letterSpacing: 1.5, textTransform: "uppercase", 
    textShadowColor: "rgba(0, 0, 0, 0.7)", textShadowOffset: { width: 2, height: 2 }, 
    textShadowRadius: 12, paddingHorizontal: 10, borderBottomWidth: 3, borderBottomColor: "#fff" 
  },
  bottomNavBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#333",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#444",
  },
  navButton: {
    alignItems: "center",
  },
  navText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
  },
});

export default HomeScreen;