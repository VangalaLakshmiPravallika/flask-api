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
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const NameStep = ({ name, updateName }) => (
  <View style={styles.stepContainer}>
    <View style={styles.iconContainer}>
      <FontAwesome5 name="user-alt" size={30} color="#fff" />
    </View>
    <Text style={styles.stepTitle}>What's your name?</Text>
    <Text style={styles.label}>We'll use this to personalize your experience</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={updateName}
        placeholder="Enter your name"
        placeholderTextColor="#999"
        selectionColor="#B06AB3"
      />
    </View>
  </View>
);

const AgeStep = ({ age, updateAge }) => (
  <View style={styles.stepContainer}>
    <View style={styles.iconContainer}>
      <FontAwesome5 name="birthday-cake" size={30} color="#fff" />
    </View>
    <Text style={styles.stepTitle}>How old are you?</Text>
    <Text style={styles.label}>Age is important for accurate health metrics</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={updateAge}
        placeholder="Enter your age"
        placeholderTextColor="#999"
        keyboardType="numeric"
        selectionColor="#B06AB3"
        maxLength={3}
      />
    </View>
  </View>
);

const GenderStep = ({ gender, updateGender }) => {
  const genderOptions = ["Male", "Female", "Other"];
  
  return (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="gender-male-female" size={30} color="#fff" />
      </View>
      <Text style={styles.stepTitle}>What's your gender?</Text>
      <Text style={styles.label}>For personalized health recommendations</Text>
      
      <View style={styles.genderOptionsContainer}>
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.genderOption,
              gender === option && styles.selectedGenderOption
            ]}
            onPress={() => updateGender(option)}
          >
            <Text style={[
              styles.genderOptionText,
              gender === option && styles.selectedGenderOptionText
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={gender}
          onChangeText={updateGender}
          placeholder="Or type your gender"
          placeholderTextColor="#999"
          selectionColor="#B06AB3"
        />
      </View>
    </View>
  );
};

const HeightStep = ({ height, updateHeight }) => (
  <View style={styles.stepContainer}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name="human-male-height" size={30} color="#fff" />
    </View>
    <Text style={styles.stepTitle}>How tall are you?</Text>
    <Text style={styles.label}>Your height helps calculate your BMI</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        value={height}
        onChangeText={updateHeight}
        placeholder="Enter your height"
        placeholderTextColor="#999"
        keyboardType="numeric"
        selectionColor="#B06AB3"
      />
      <Text style={styles.unitText}>cm</Text>
    </View>
  </View>
);

const WeightStep = ({ weight, updateWeight }) => (
  <View style={styles.stepContainer}>
    <View style={styles.iconContainer}>
      <FontAwesome5 name="weight" size={30} color="#fff" />
    </View>
    <Text style={styles.stepTitle}>What's your weight?</Text>
    <Text style={styles.label}>Your weight is the final piece to calculate your BMI</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={updateWeight}
        placeholder="Enter your weight"
        placeholderTextColor="#999"
        keyboardType="numeric"
        selectionColor="#B06AB3"
      />
      <Text style={styles.unitText}>kg</Text>
    </View>
  </View>
);

const SummaryStep = ({ userData }) => {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <FontAwesome5 name="clipboard-check" size={30} color="#fff" />
      </View>
      <Text style={styles.stepTitle}>Your Health Summary</Text>
      <Text style={styles.label}>Here's a summary of your profile</Text>
      
      <BlurView intensity={30} tint="light" style={styles.summaryCard}>
        <View style={styles.summaryItemRow}>
          <View style={styles.summaryItem}>
            <FontAwesome5 name="user-alt" size={16} color="#4568DC" style={styles.summaryIcon} />
            <Text style={styles.summaryLabel}>Name</Text>
            <Text style={styles.summaryValue}>{userData.name}</Text>
          </View>
          <View style={styles.summaryItem}>
            <FontAwesome5 name="birthday-cake" size={16} color="#4568DC" style={styles.summaryIcon} />
            <Text style={styles.summaryLabel}>Age</Text>
            <Text style={styles.summaryValue}>{userData.age}</Text>
          </View>
        </View>
        
        <View style={styles.summaryItemRow}>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="gender-male-female" size={16} color="#4568DC" style={styles.summaryIcon} />
            <Text style={styles.summaryLabel}>Gender</Text>
            <Text style={styles.summaryValue}>{userData.gender}</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="human-male-height" size={16} color="#4568DC" style={styles.summaryIcon} />
            <Text style={styles.summaryLabel}>Height</Text>
            <Text style={styles.summaryValue}>{userData.height} cm</Text>
          </View>
        </View>
        
        <View style={styles.summaryItemRow}>
          <View style={styles.summaryItem}>
            <FontAwesome5 name="weight" size={16} color="#4568DC" style={styles.summaryIcon} />
            <Text style={styles.summaryLabel}>Weight</Text>
            <Text style={styles.summaryValue}>{userData.weight} kg</Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const HealthDataForm = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    bmi: '',
  });
  
  const totalSteps = 6;

  useEffect(() => {
    slideAnim.setValue(0);
    opacityAnim.setValue(1);
  }, []);

  const handleNext = () => {
    if (validateCurrentStep() && !animating) {
      setAnimating(true);
      
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(prevStep => prevStep + 1);
        
        slideAnim.setValue(width * 0.02);
        
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start(() => {
          setAnimating(false);
        });
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0 && !animating) {
      setAnimating(true);
      
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(prevStep => prevStep - 1);
        slideAnim.setValue(-width * 0.02);
        
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start(() => {
          setAnimating(false);
        });
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
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      const token = await AsyncStorage.getItem('authToken');

      const response = await fetch('https://healthfitnessbackend.onrender.com/api/store-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUserData((prevData) => ({ ...prevData, bmi: data.bmi }));
        Alert.alert('Success', `Health Data Saved! Your BMI: ${data.bmi}`);
        navigation.replace('Home'); 
      } else {
        Alert.alert('Error', data.error || 'Failed to save health data');
      }
    } catch (error) {
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
        return <SummaryStep userData={userData} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#4568DC', '#6A45A0', '#B06AB3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      
      {/* Decorative Shapes */}
      <View style={styles.shapesContainer}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>
      
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.activeProgressDot,
                index < currentStep && styles.completedProgressDot,
              ]}
            />
          ))}
        </View>
        <Text style={styles.headerText}>
          {currentStep === 5 ? 'Almost Done!' : `Step ${currentStep + 1} of ${totalSteps - 1}`}
        </Text>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
        <View style={styles.scrollContainer}>
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: opacityAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {getStepContent()}
          </Animated.View>
          
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBack}
                disabled={animating}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.nextButton, (!validateCurrentStep() || animating) && styles.disabledButton]}
              onPress={currentStep === 5 ? handleSubmit : handleNext}
              disabled={!validateCurrentStep() || animating}
            >
              {currentStep === 5 ? (
                <LinearGradient
                  colors={['#43e97b', '#38f9d7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.nextButtonText}>FINISH</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={['#4568DC', '#B06AB3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.nextButtonText}>NEXT</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Enhanced Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  background: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    top: 0, 
    bottom: 0 
  },
  keyboardAvoid: { 
    flex: 1 
  },
  scrollContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20 
  },
  contentContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%' 
  },
  stepContainer: { 
    width: '100%', 
    alignItems: 'center', 
    padding: 20 
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center'
  },
  label: { 
    fontSize: 16, 
    marginBottom: 24, 
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center'
  },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative'
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#333',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  unitText: {
    position: 'absolute',
    right: 15,
    color: '#999',
    fontSize: 16
  },
  summaryCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  summaryIcon: {
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  genderOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  genderOption: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedGenderOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: '#4568DC',
  },
  genderOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  selectedGenderOptionText: {
    color: '#4568DC',
  },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 30,
    width: '100%',
  },
  backButton: { 
    width: 50,
    height: 50,
    borderRadius: 25, 
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButton: { 
    flex: 1, 
    marginLeft: 15,
    height: 50, 
    borderRadius: 25, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
  },
  nextButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  disabledButton: { 
    opacity: 0.5 
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 5,
  },
  activeProgressDot: {
    backgroundColor: '#fff',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  completedProgressDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  shapesContainer: {
    position: 'absolute',
    width: width,
    height: height,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    bottom: -50,
    right: 50,
  },
});

export default HealthDataForm;