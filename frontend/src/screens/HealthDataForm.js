import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  Animated,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";  // ✅ Import navigation

const { width } = Dimensions.get('window');

const HealthDataForm = () => {
  const navigation = useNavigation();  // ✅ Initialize navigation

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  // State for form fields
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');

  // Run animations on component mount
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    if (!height || !weight || !age || !gender) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const ageNum = parseInt(age);

    if (isNaN(heightNum) || isNaN(weightNum) || isNaN(ageNum)) {
      Alert.alert("Error", "Please enter valid numbers for height, weight, and age");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch("https://healthfitnessbackend.onrender.com/api/save-health-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          height: heightNum,
          weight: weightNum,
          age: ageNum,
          gender,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", `Health Data Saved! Your BMI: ${data.bmi}`);
        
        // ✅ Redirect to Home after submission
        navigation.replace("Home");

      } else {
        Alert.alert("Error", data.error || "Failed to save health data");
      }
    } catch (error) {
      console.error("Error saving health data:", error);
      Alert.alert("Error", "Something went wrong!");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80' }} 
        style={styles.backgroundImage}
        blurRadius={3}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.headerContainer}>
                  <Text style={styles.title}>HEALTH PROFILE</Text>
                  <View style={styles.divider} />
                  <Text style={styles.subtitle}>Your journey to fitness starts here</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>HEIGHT</Text>
                  <View style={styles.unitInputContainer}>
                    <TextInput
                      style={styles.unitInput}
                      placeholder="Enter height"
                      placeholderTextColor="#aaa"
                      value={height}
                      onChangeText={setHeight}
                      keyboardType="numeric"
                    />
                    <View style={styles.unitPicker}>
                      <Picker
                        selectedValue={heightUnit}
                        onValueChange={(itemValue) => setHeightUnit(itemValue)}
                        style={styles.picker}
                        dropdownIconColor="#fff"
                      >
                        <Picker.Item label="cm" value="cm" />
                        <Picker.Item label="feet" value="feet" />
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>WEIGHT</Text>
                  <View style={styles.unitInputContainer}>
                    <TextInput
                      style={styles.unitInput}
                      placeholder="Enter weight"
                      placeholderTextColor="#aaa"
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                    />
                    <View style={styles.unitPicker}>
                      <Picker
                        selectedValue={weightUnit}
                        onValueChange={(itemValue) => setWeightUnit(itemValue)}
                        style={styles.picker}
                        dropdownIconColor="#fff"
                      >
                        <Picker.Item label="kg" value="kg" />
                        <Picker.Item label="lbs" value="lbs" />
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>AGE</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter age"
                    placeholderTextColor="#aaa"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>GENDER</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={gender}
                      onValueChange={(itemValue) => setGender(itemValue)}
                      style={styles.fullPicker}
                      dropdownIconColor="#fff"
                    >
                      <Picker.Item label="Select gender" value="" />
                      <Picker.Item label="Male" value="male" />
                      <Picker.Item label="Female" value="female" />
                      <Picker.Item label="Non-binary" value="non-binary" />
                      <Picker.Item label="Prefer not to say" value="not-specified" />
                    </Picker>
                  </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <LinearGradient colors={['#4CAF50', '#8BC34A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
                    <Text style={styles.buttonText}>SAVE INFORMATION</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
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
    width: '100%',
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    borderRadius: 15,
    padding: 25,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
    letterSpacing: 1,
  },
  divider: {
    width: width * 0.3,
    height: 3,
    backgroundColor: '#4CAF50',
    marginVertical: 10,
    borderRadius: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#bbb',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    fontSize: 16,
    color: '#fff',
  },
  unitInputContainer: {
    flexDirection: 'row',
  },
  unitInput: {
    flex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    fontSize: 16,
    color: '#fff',
  },
  unitPicker: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#fff',
  },
  pickerItem: {
    color: '#fff',
  },
  fullPicker: {
    height: 50,
    color: '#fff',
  },
  button: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  summaryContainer: {
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#fff',
    letterSpacing: 1,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#bbb',
    marginBottom: 5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  summaryValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HealthDataForm;