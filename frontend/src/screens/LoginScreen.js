import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  ImageBackground,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Information", "Please enter both email and password");
      return;
    }
  
    if (!validateEmail(email)) {
      Alert.alert("Invalid Format", "Please enter a valid email address");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const loginResponse = await axios.post("https://healthfitnessbackend.onrender.com/api/login", {
        email,
        password,
      });
  
      if (loginResponse.status === 200) {
        const { token, profileComplete } = loginResponse.data;
        await AsyncStorage.setItem("authToken", token);
  
        if (profileComplete) {
          navigation.replace("Home");
        } else {
          navigation.replace("HealthDataForm");
        }
      } else {
        setFailedAttempts(failedAttempts + 1);
        if (failedAttempts >= 2) {
          setShowForgotPassword(true);
        }
        Alert.alert("Login Failed", loginResponse.data.error || "Please check your credentials and try again");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        if (error.response.status === 404) {
          Alert.alert("Error", "The requested resource was not found. Please check the API endpoint.");
        } else if (error.response.status === 401) {
          Alert.alert("Error", "Invalid credentials. Please try again.");
        } else {
          Alert.alert("Error", `Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        Alert.alert("Error", "No response from the server. Please check your internet connection.");
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword"); // Navigate to ForgotPassword screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438" }}
        style={styles.backgroundImage}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.replace("Home")}
          >
            <BlurView intensity={80} tint="dark" style={styles.skipButtonBlur}>
              <Text style={styles.skipText}>Skip</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>HF</Text>
              </View>
              <Text style={styles.appName}>Health Fitness</Text>
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <BlurView intensity={30} tint="dark" style={styles.formBlur}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitleText}>Sign in to continue your fitness journey</Text>

              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#fff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { opacity: email && password && !isLoading ? 1 : 0.7 },
                ]}
                onPress={handleLogin}
                disabled={!email || !password || isLoading}
              >
                <LinearGradient
                  colors={["#4CAF50", "#2E7D32"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradient}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.footerContainer}>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                  <Text style={styles.registerText}>
                    New user? <Text style={styles.registerHighlight}>Create Account</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  skipButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 40 : 20,
    right: 20,
    zIndex: 10,
  },
  skipButtonBlur: {
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    marginRight: 4,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  appName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 40,
    width: "88%",
    alignSelf: "center",
    borderRadius: 24,
    overflow: "hidden",
  },
  formBlur: {
    padding: 24,
    borderRadius: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#fff",
    fontSize: 16,
  },
  loginButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  forgotText: {
    color: "#fff",
    marginBottom: 16,
    fontSize: 14,
    fontWeight: "500",
  },
  registerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  registerHighlight: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});