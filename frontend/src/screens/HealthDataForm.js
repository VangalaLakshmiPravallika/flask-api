import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // ✅ Import navigation

const { width } = Dimensions.get('window');

const OnboardingFlow = () => {
  const navigation = useNavigation(); // ✅ Use navigation hook
  const [currentStep, setCurrentStep] = useState(0);
  const [animation] = useState(new Animated.Value(0));
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
  });

  // Animation values
  const slideValue = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });

  const fadeValue = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const animateIn = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = (callback) => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      animation.setValue(0);
      callback();
    });
  };

  React.useEffect(() => {
    animateIn();
  }, [currentStep]);

  const handleNext = () => {
    if (validateCurrentStep()) {
      animateOut(() => {
        setCurrentStep(currentStep + 1);
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateOut(() => {
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

  const updateUserData = (field, value) => {
    setUserData({
      ...userData,
      [field]: value,
    });
  };

  const handleFinish = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
  
      const response = await fetch("https://healthfitnessbackend.onrender.com/api/store-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        Alert.alert("Success", `Profile saved! Your BMI: ${data.bmi}`);
        navigation.replace("Home"); 
      } else {
        Alert.alert("Error", data.error || "Failed to store profile.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Something went wrong!");
    }
  };
  

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <NameStep 
            name={userData.name} 
            updateName={(value) => updateUserData('name', value)} 
          />
        );
      case 1:
        return (
          <AgeStep 
            age={userData.age} 
            updateAge={(value) => updateUserData('age', value)} 
          />
        );
      case 2:
        return (
          <GenderStep 
            gender={userData.gender} 
            updateGender={(value) => updateUserData('gender', value)} 
          />
        );
      case 3:
        return (
          <HeightStep 
            height={userData.height} 
            updateHeight={(value) => updateUserData('height', value)} 
          />
        );
      case 4:
        return (
          <WeightStep 
            weight={userData.weight} 
            updateWeight={(value) => updateUserData('weight', value)} 
          />
        );
      case 5:
        return <SummaryStep userData={userData} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === 5;
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#4568DC', '#B06AB3']}
        style={styles.background}
      />
      
      <View style={styles.headerContainer}>
        <Text style={styles.stepTitle}>Step {currentStep + 1}/6</Text>
      </View>
      
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            transform: [{ translateX: slideValue }],
            opacity: fadeValue,
          }
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
          style={[
            styles.nextButton,
            !validateCurrentStep() && styles.disabledButton,
            isLastStep && styles.doneButton
          ]}
          onPress={isLastStep ? handleFinish : handleNext}
          disabled={!validateCurrentStep()}
        >
          <Text style={styles.nextButtonText}>
            {isLastStep ? 'START MY JOURNEY' : 'CONTINUE'}
          </Text>
          {!isLastStep && <Ionicons name="arrow-forward" size={24} color="#fff" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  contentContainer: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  doneButton: {
    backgroundColor: '#FF4500',
  },
  nextButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default HealthDataForm;
