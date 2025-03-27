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
  ScrollView,
  Easing
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { height, width } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("authToken");
      setLoggedIn(!!token);
    };
    checkLoginStatus();

    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: menuVisible ? 0 : -300,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [menuVisible]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    setLoggedIn(false);
    Alert.alert("👋 Success", "You've been logged out successfully!");
  };

  const handleNewsPress = async () => {
    try {
      const response = await fetch("https://healthfitnessbackend.onrender.com/api/news");
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const newsData = await response.json();
      navigation.navigate("News", { news: newsData });
    } catch (error) {
      console.error("Error fetching news:", error);
      Alert.alert("Error", "Failed to fetch health news. Please try again later.");
    }
  };

  const menuItems = [
    { screen: "SleepTracker", name: "Sleep Tracker", icon: "moon" },
    { screen: "Achievements", name: "Achievements", icon: "trophy" },
    { screen: "JoinGroup", name: "Join Group", icon: "people" },
    { screen: "MealTracker", name: "Meal Tracker", icon: "restaurant" },
    { screen: "MealRecommendations", name: "Diet Tips", icon: "nutrition" }, 
    { screen: "WorkoutPlan", name: "Workout Plan", icon: "barbell" },
    { screen: "StepCounter", name: "Step Counter", icon: "walk" },
    { screen: "StepHistory", name: "Step History", icon: "analytics" },
    { screen: "ChatBot", name: "Health Assistant", icon: "chatbubbles" },
    { screen: "Challenges", name: "Challenges", icon: "flag" }
  ];

  const featureCards = [
    { screen: "SleepTracker", name: "Sleep", icon: "moon", color: "#6a11cb" },
    { screen: "MealTracker", name: "Nutrition", icon: "restaurant", color: "#2575fc" },
    { screen: "WorkoutPlan", name: "Workouts", icon: "barbell", color: "#fc4a1a" },
    { screen: "StepCounter", name: "Steps", icon: "walk", color: "#1fa2ff" }
  ];

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
    >
      {/* Header with Hamburger */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.hamburgerButton} 
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <Ionicons name="menu" size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FitFolks</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Animated Sidebar */}
      <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e']}
          style={styles.menuGradient}
        >
          <ScrollView style={styles.menuScroll}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setMenuVisible(false)}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.menuItem} 
                onPress={() => { 
                  setMenuVisible(false); 
                  navigation.navigate(item.screen);
                }}
              >
                <Ionicons name={item.icon} size={22} color="#fff" style={styles.menuIcon} />
                <Text style={styles.menuText}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>
      </Animated.View>

      {/* Main Content */}
      <Animated.View style={[styles.mainContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Track your fitness journey</Text>
        
        {/* Feature Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.cardContainer}
        >
          {featureCards.map((card, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.featureCard, { backgroundColor: card.color }]}
              onPress={() => navigation.navigate(card.screen)}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
                style={styles.cardGradient}
              >
                <Ionicons name={card.icon} size={40} color="#fff" />
                <Text style={styles.cardText}>{card.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleNewsPress}
          >
            <Ionicons name="newspaper" size={24} color="#fff" />
            <Text style={styles.actionText}>Health News</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={loggedIn ? handleLogout : () => navigation.navigate("Login")}
          >
            <Ionicons name={loggedIn ? "log-out" : "log-in"} size={24} color="#fff" />
            <Text style={styles.actionText}>{loggedIn ? "Logout" : "Login"}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom Navigation */}
      <LinearGradient
        colors={['rgba(15,12,41,0.7)', 'rgba(48,43,99,0.9)']}
        style={styles.bottomNav}
      >
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="home" size={24} color="#FFD700" />
          <Text style={styles.navButtonText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate("Challenges")}
        >
          <Ionicons name="trophy" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Challenges</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate("ChatBot")}
        >
          <Ionicons name="chatbubbles" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Assistant</Text>
        </TouchableOpacity>
      </LinearGradient>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  hamburgerButton: {
    padding: 10,
  },
  profileButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFD700',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: height,
    width: 300,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  menuGradient: {
    flex: 1,
    paddingTop: 60,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  closeButton: {
    padding: 5,
  },
  menuScroll: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 30,
  },
  cardContainer: {
    marginBottom: 30,
  },
  featureCard: {
    width: 150,
    height: 180,
    borderRadius: 20,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginHorizontal: 10,
  },
  navButton: {
    alignItems: 'center',
    padding: 5,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
});

export default HomeScreen;