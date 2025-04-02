import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  ImageBackground,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await axios.get("https://healthfitnessbackend.onrender.com/api/get-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setUserData(response.data);
      } else {
        throw new Error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Unable to load profile data. Please log in again.");
      navigation.navigate("Login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#E3F2FD', '#BBDEFB']}
        style={styles.loadingContainer}
      >
        <Animatable.View 
          animation="pulse"
          iterationCount="infinite"
        >
          <ActivityIndicator size="large" color="#4CAF50" />
        </Animatable.View>
      </LinearGradient>
    );
  }

  const getBmiStatus = (bmi) => {
    if (!bmi) return { color: '#9E9E9E', status: 'N/A' };
    if (bmi < 18.5) return { color: '#2196F3', status: 'Underweight' };
    if (bmi < 25) return { color: '#4CAF50', status: 'Healthy' };
    if (bmi < 30) return { color: '#FFC107', status: 'Overweight' };
    return { color: '#F44336', status: 'Obese' };
  };

  const bmiStatus = userData?.bmi ? getBmiStatus(userData.bmi) : getBmiStatus(null);

  return (
    <ImageBackground 
      source={require('../../assets/profile-bg.jpeg')}
      style={styles.backgroundImage}
      blurRadius={1}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animatable.View 
          animation="fadeInUp"
          duration={800}
          style={styles.profileCard}
        >
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialIcons name="person" size={32} color="#fff" />
            <Text style={styles.heading}>User Profile</Text>
          </LinearGradient>

          {userData ? (
            <View style={styles.detailsContainer}>
              <ProfileDetail 
                icon="person-outline" 
                label="Name" 
                value={userData.name} 
              />
              <ProfileDetail 
                icon="event" 
                label="Age" 
                value={userData.age} 
              />
              <ProfileDetail 
                icon="fitness-center" 
                label="Weight" 
                value={`${userData.weight} kg`} 
              />
              <ProfileDetail 
                icon="straighten" 
                label="Height" 
                value={`${userData.height} cm`} 
              />
              <ProfileDetail 
                icon="wc" 
                label="Gender" 
                value={userData.gender} 
              />
              
              <View style={styles.bmiContainer}>
                <MaterialIcons name="assessment" size={24} color={bmiStatus.color} />
                <Text style={styles.detailLabel}>BMI: </Text>
                <Text style={[styles.detailValue, { color: bmiStatus.color }]}>
                  {userData.bmi?.toFixed(2) || "N/A"}
                </Text>
                <Text style={[styles.bmiStatus, { color: bmiStatus.color }]}>
                  ({bmiStatus.status})
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <MaterialIcons name="error-outline" size={40} color="#9E9E9E" />
              <Text style={styles.noDataText}>No details available</Text>
              <Text style={styles.noDataSubtext}>Please add your profile details</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("HealthDataForm")}
          >
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialIcons name="edit" size={20} color="#fff" />
              <Text style={styles.buttonText}> Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </ImageBackground>
  );
};

const ProfileDetail = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <MaterialIcons name={icon} size={24} color="#4CAF50" />
    <Text style={styles.detailLabel}>{label}: </Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 25,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
    fontFamily: 'sans-serif-medium',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  detailsContainer: {
    padding: 25,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  detailLabel: {
    fontSize: 16,
    color: '#616161',
    marginLeft: 10,
    fontFamily: 'sans-serif',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    fontFamily: 'sans-serif-medium',
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  bmiStatus: {
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 5,
    fontFamily: 'sans-serif',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 18,
    color: '#616161',
    marginTop: 15,
    fontFamily: 'sans-serif-medium',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 5,
    fontFamily: 'sans-serif',
  },
  editButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'sans-serif-medium',
  },
});

export default ProfileScreen;