import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Step Components
const NameStep = ({ name, updateName }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.label}>Name</Text>
    <TextInput
      style={styles.input}
      value={name}
      onChangeText={updateName}
      placeholder="Enter your name"
      placeholderTextColor="#999"
    />
  </View>
);

const AgeStep = ({ age, updateAge }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.label}>Age</Text>
    <TextInput
      style={styles.input}
      value={age}
      onChangeText={updateAge}
      placeholder="Enter your age"
      placeholderTextColor="#999"
      keyboardType="numeric"
    />
  </View>
);

const GenderStep = ({ gender, updateGender }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.label}>Gender</Text>
    <TextInput
      style={styles.input}
      value={gender}
      onChangeText={updateGender}
      placeholder="Enter your gender"
      placeholderTextColor="#999"
    />
  </View>
);

const HeightStep = ({ height, updateHeight }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.label}>Height (cm)</Text>
    <TextInput
      style={styles.input}
      value={height}
      onChangeText={updateHeight}
      placeholder="Enter your height"
      placeholderTextColor="#999"
      keyboardType="numeric"
    />
  </View>
);

const WeightStep = ({ weight, updateWeight }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.label}>Weight (kg)</Text>
    <TextInput
      style={styles.input}
      value={weight}
      onChangeText={updateWeight}
      placeholder="Enter your weight"
      placeholderTextColor="#999"
      keyboardType="numeric"
    />
  </View>
);

const SummaryStep = ({ userData, bmi }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.label}>Summary</Text>
    <Text style={styles.summaryText}>Name: {userData.name}</Text>
    <Text style={styles.summaryText}>Age: {userData.age}</Text>
    <Text style={styles.summaryText}>Gender: {userData.gender}</Text>
    <Text style={styles.summaryText}>Height: {userData.height} cm</Text>
    <Text style={styles.summaryText}>Weight: {userData.weight} kg</Text>
    <Text style={styles.summaryText}>BMI: {bmi}</Text>
  </View>
);

// Main Component
const HealthDataForm = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const animation = useRef(new Animated.Value(0)).current;
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
  });
  const [bmi, setBmi] = useState(null); // State to store BMI

  // Animation interpolation
  const slideValue = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });

  // Run animation when currentStep changes
  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  // Fetch BMI when height and weight are available
  useEffect(() => {
    if (currentStep === 5 && userData.height && userData.weight) {
      fetchBMI();
    }
  }, [currentStep]);

  const fetchBMI = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await fetch('https://healthfitnessbackend.onrender.com/api/get-bmi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          height: userData.height,
          weight: userData.weight,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBmi(data.bmi); // Set BMI in state
      } else {
        Alert.alert('Error', data.error || 'Failed to calculate BMI');
      }
    } catch (error) {
      console.error('Error fetching BMI:', error);
      Alert.alert('Error', 'Something went wrong while calculating BMI');
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep - 1);
      });
    }
  };

  const validateCurrentStep = () => {
    const { name, age, gender, height, weight } = userData;
    switch (currentStep) {
      case 0:
        return name.trim().length > 0;
      case 1:
        return age.trim().length > 0 && !isNaN(Number(age));
      case 2:
        return gender.trim().length > 0;
      case 3:
        return height.trim().length > 0 && !isNaN(Number(height));
      case 4:
        return weight.trim().length > 0 && !isNaN(Number(weight));
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await fetch('https://healthfitnessbackend.onrender.com/api/save-health-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', `Health Data Saved! Your BMI: ${bmi}`);
        navigation.replace('Home'); // Redirect to HomeScreen
      } else {
        Alert.alert('Error', data.error || 'Failed to save health data');
      }
    } catch (error) {
      console.error('Error:', error); // Log the error for debugging
      Alert.alert('Error', 'Something went wrong!');
    }
  };

  const updateUserData = (field, value) => {
    setUserData({ ...userData, [field]: value });
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return <NameStep name={userData.name} updateName={(value) => updateUserData('name', value)} />;
      case 1:
        return <AgeStep age={userData.age} updateAge={(value) => updateUserData('age', value)} />;
      case 2:
        return <GenderStep gender={userData.gender} updateGender={(value) => updateUserData('gender', value)} />;
      case 3:
        return <HeightStep height={userData.height} updateHeight={(value) => updateUserData('height', value)} />;
      case 4:
        return <WeightStep weight={userData.weight} updateWeight={(value) => updateUserData('weight', value)} />;
      case 5:
        return <SummaryStep userData={userData} bmi={bmi} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#4568DC', '#B06AB3']} style={styles.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
        <View style={styles.scrollContainer}>
          <Animated.View
            style={[
              styles.contentContainer,
              {
                transform: [{ translateX: slideValue }],
              },
            ]}
          >
            {getStepContent()}
          </Animated.View>
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextButton, !validateCurrentStep() && styles.disabledButton]}
              onPress={currentStep === 5 ? handleSubmit : handleNext}
              disabled={!validateCurrentStep()}
            >
              <Text style={styles.nextButtonText}>{currentStep === 5 ? 'FINISH' : 'NEXT'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  keyboardAvoid: { flex: 1 },
  scrollContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  contentContainer: { alignItems: 'center', justifyContent: 'center' },
  stepContainer: { width: '100%', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 10, color: '#fff' },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    color: '#000',
  },
  summaryText: { fontSize: 16, color: '#fff', marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  backButton: { padding: 15, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.3)' },
  nextButton: { padding: 15, borderRadius: 50, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { opacity: 0.5 },
});

export default HealthDataForm;