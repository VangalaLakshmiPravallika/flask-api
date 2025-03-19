import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(40))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Missing Information", "Please enter email and password.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Invalid Format", "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://healthfitnessbackend.onrender.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Registration Successful", "Your account has been created. Please login now.", [
          { text: "Login", onPress: () => navigation.navigate("Login") }
        ]);
      } else {
        Alert.alert("Registration Failed", data.error || "Please try again with different credentials.");
      }
    } catch (error) {
      Alert.alert("Connection Error", "Unable to connect to our servers. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = password.length < 1 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const passwordColors = ["#transparent", "#FF6B6B", "#FFD166", "#06D6A0"];
  const passwordText = ["", "Weak", "Medium", "Strong"];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b" }}
        style={styles.backgroundImage}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <BlurView intensity={80} tint="dark" style={styles.backButtonBlur}>
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </BlurView>
            </TouchableOpacity>
            
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Text style={styles.headerTitle}>Create Account</Text>
              <Text style={styles.headerSubtitle}>Join the fitness revolution</Text>
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
              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#fff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
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
                
                {password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.passwordStrengthBars}>
                      <View style={[styles.strengthBar, { backgroundColor: passwordColors[Math.max(1, passwordStrength)] }]} />
                      <View style={[styles.strengthBar, { backgroundColor: passwordColors[Math.max(1, passwordStrength >= 2 ? 2 : 0)] }]} />
                      <View style={[styles.strengthBar, { backgroundColor: passwordColors[Math.max(1, passwordStrength >= 3 ? 3 : 0)] }]} />
                    </View>
                    <Text style={[styles.strengthText, { color: passwordColors[Math.max(1, passwordStrength)] }]}>
                      {passwordText[passwordStrength]}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  { opacity: email && password && !isLoading ? 1 : 0.7 },
                ]}
                onPress={handleRegister}
                disabled={!email || !password || isLoading}
              >
                <LinearGradient
                  colors={["#4CAF50", "#2E7D32"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.registerButtonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <BlurView intensity={40} tint="dark" style={styles.socialButtonBlur}>
                    <Ionicons name="logo-google" size={20} color="#fff" />
                  </BlurView>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <BlurView intensity={40} tint="dark" style={styles.socialButtonBlur}>
                    <Ionicons name="logo-apple" size={20} color="#fff" />
                  </BlurView>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <BlurView intensity={40} tint="dark" style={styles.socialButtonBlur}>
                    <Ionicons name="logo-facebook" size={20} color="#fff" />
                  </BlurView>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginHighlight}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  headerContainer: {
    marginTop: Platform.OS === "ios" ? 20 : 40,
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  backButtonBlur: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 6,
  },
  formContainer: {
    flex: 1,
    marginTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  formBlur: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: "#fff",
    fontSize: 16,
  },
  passwordStrengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
  },
  passwordStrengthBars: {
    flexDirection: "row",
    flex: 1,
    marginRight: 10,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  registerButton: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.6)",
    marginHorizontal: 10,
    fontSize: 12,
    fontWeight: "600",
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  socialButton: {
    marginHorizontal: 10,
  },
  socialButtonBlur: {
    borderRadius: 20,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  loginLink: {
    alignItems: "center",
  },
  loginText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  loginHighlight: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});

export default RegisterScreen;