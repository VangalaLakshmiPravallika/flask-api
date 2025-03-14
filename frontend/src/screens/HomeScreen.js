import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  StyleSheet, 
  ImageBackground, 
  Alert, 
  Dimensions 
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
  const imageSlideAnim = useState(new Animated.Value(-150))[0]; 

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

  useEffect(() => {
    Animated.timing(imageSlideAnim, {
      toValue: 30,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    setLoggedIn(false);
    Alert.alert("✅ Logged out successfully!");
  };

  return (
    <ImageBackground
      source={{ uri: "https://img.freepik.com/free-photo/top-view-yoga-essential-items_23-2149458975.jpg?t=st=1740846870~exp=1740850470~hmac=5c2f451381c50cb6bb7460cf79b7d4bedfde292cc52bcc04092ee3ce7ba4c0e6&w=740" }}
      style={styles.container}
    >
      {/* Logout Button (Top-Right) */}
      <TouchableOpacity 
        style={styles.topRightButton} 
        onPress={loggedIn ? handleLogout : () => navigation.navigate("Login")}
      >
        <Text style={styles.topRightText}>{loggedIn ? "Logout" : "Login"}</Text>
      </TouchableOpacity>

      {/* Hamburger Button (Toggles Menu) */}
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

        {/* Menu Items */}
        {[
          "SleepTracker", 
          "Achievements", 
          "JoinGroup", 
          "MealTracker", 
          "FitnessAssessment", 
          "WorkoutPlan", 
          "ProgressTracker", 
          "Profile",
          "StepCounter"  
        ].map((screen, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={() => navigation.navigate(screen)}>
            <Text style={styles.menuText}>{screen.replace(/([A-Z])/g, " $1").trim()}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Animated Sliding Image */}
        <Animated.Image
          source={{ uri: "" }}
          style={[styles.slidingImage, { transform: [{ translateY: imageSlideAnim }] }]}
        />

        {/* App Title */}
        <Text style={styles.title}>Fit-Folks</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  topRightButton: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 30,
    elevation: 5,
  },
  topRightText: {
    color: "#007bff",
    fontSize: 16,
    fontWeight: "bold",
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: height,
    width: 250,
    backgroundColor: "#B8860B",
    paddingTop: 60,
    paddingLeft: 20,
    zIndex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  hamburgerButton: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 30,
    elevation: 5,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slidingImage: {
    width: width * 0.8, 
    height: height * 0.25, 
    resizeMode: "contain", 
    marginBottom: 10, 
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#FFD700", 
    textAlign: "center",
    letterSpacing: 1.5, 
    textTransform: "uppercase", 
    textShadowColor: "rgba(0, 0, 0, 0.7)", 
    textShadowOffset: { width: 2, height: 2 }, 
    textShadowRadius: 12, 
    paddingHorizontal: 10, 
    borderBottomWidth: 3, 
    borderBottomColor: "#fff", 
  },
});

export default HomeScreen;
