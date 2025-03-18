import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ImageBackground,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Title, Surface, Chip } from "react-native-paper";
import MultiSelect from "react-native-multiple-select";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const MealTracker = ({ navigation }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [meals, setMeals] = useState({ breakfast: [], lunch: [], snacks: [], dinner: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("breakfast");

  const mealIcons = {
    breakfast: "sunny-outline",
    lunch: "restaurant-outline",
    snacks: "cafe-outline",
    dinner: "moon-outline",
  };

  const mealColors = {
    breakfast: ["#FF9F43", "#FFBE76"],
    lunch: ["#2ED573", "#7BED9F"],
    snacks: ["#FF6B81", "#FFA3B3"],
    dinner: ["#5352EC", "#7B7BED"],
  };

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await axios.get("https://healthfitnessbackend.onrender.com/api/get-food-items");
        if (response.data.food_items.length === 0) {
          Alert.alert("⚠️ Warning", "No food items found in the database.");
        }
        setFoodItems(response.data.food_items.map((food, index) => ({ id: index.toString(), name: food })));
      } catch (error) {
        console.error("Error fetching food items:", error);
        Alert.alert("⚠️ Error", "Failed to load food items.");
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, []);

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const updateMeal = (mealType, selectedItems) => {
    setMeals((prevMeals) => ({
      ...prevMeals,
      [mealType]: selectedItems.map((id) => foodItems.find((item) => item.id === id)?.name || ""),
    }));
  };

  const logMeal = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠️ Error", "You must be logged in to log meals.");
        return;
      }

      await axios.post(
        "https://healthfitnessbackend.onrender.com/api/log-meal",
        { meals },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("✅ Success", "Meal logged successfully!");
      navigation.navigate("MealSummary");
    } catch (error) {
      console.error("Error logging meal:", error);
      Alert.alert("⚠️ Error", "Failed to log meal.");
    }
  };

  const renderSelectedItems = (mealType) => {
    if (meals[mealType].length === 0) {
      return (
        <Text style={styles.emptySelectionText}>No items selected yet</Text>
      );
    }
    
    return (
      <View style={styles.selectedItemsContainer}>
        {meals[mealType].map((item, index) => (
          <Chip
            key={index}
            style={styles.chip}
            textStyle={styles.chipText}
            onClose={() => {
              const updatedMeal = [...meals[mealType]];
              updatedMeal.splice(index, 1);
              setMeals({ ...meals, [mealType]: updatedMeal });
            }}
          >
            {item}
          </Chip>
        ))}
      </View>
    );
  };

  // Render the active meal content
  const renderActiveMealContent = () => {
    return (
      <Surface style={styles.mealCardContainer}>
        <LinearGradient
          colors={mealColors[activeTab]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mealCardHeader}
        >
          <Ionicons name={mealIcons[activeTab]} size={24} color="#FFF" />
          <Title style={styles.mealCardTitle}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </Title>
        </LinearGradient>

        <View style={styles.mealCardBody}>
          <Text style={styles.selectText}>Select your food items:</Text>
          <View style={styles.multiSelectContainer}>
            <MultiSelect
              hideTags
              items={foodItems}
              uniqueKey="id"
              onSelectedItemsChange={(selectedItems) => updateMeal(activeTab, selectedItems)}
              selectedItems={meals[activeTab].map(
                (food) => foodItems.find((item) => item.name === food)?.id || ""
              )}
              selectText="Search and select food items"
              searchInputPlaceholderText="Type to search foods..."
              tagRemoveIconColor="#FF6B6B"
              tagBorderColor="#EEEEEE"
              tagTextColor="#333"
              selectedItemTextColor="#2ED573"
              selectedItemIconColor="#2ED573"
              itemTextColor="#333"
              displayKey="name"
              submitButtonText="Done"
              submitButtonColor={mealColors[activeTab][0]}
              styleDropdownMenuSubsection={{
                backgroundColor: '#F7F7F7',
                borderRadius: 8,
                padding: 10,
                height: 50,
                borderWidth: 1,
                borderColor: '#EEEEEE',
              }}
              styleTextDropdownSelected={{ fontSize: 16, paddingLeft: 8 }}
              searchInputStyle={{ height: 40 }}
              styleItemsContainer={{ maxHeight: 150 }}
              fixAndroidTouchableBug={true}
              canAddItems={false}
            />
          </View>

          <Text style={styles.selectedTitle}>Selected Foods:</Text>
          {renderSelectedItems(activeTab)}
        </View>
      </Surface>
    );
  };

  const renderTabs = () => {
    return (
      <View style={styles.tabContainer}>
        {Object.keys(meals).map((meal) => (
          <TouchableOpacity
            key={meal}
            activeOpacity={0.7}
            style={[
              styles.tab,
              activeTab === meal && {
                backgroundColor: mealColors[meal][0],
                borderBottomWidth: 3,
                borderBottomColor: "#FFF"
              }
            ]}
            onPress={() => handleTabPress(meal)}
          >
            <Ionicons 
              name={mealIcons[meal]} 
              size={22} 
              color={activeTab === meal ? "#FFF" : "#CCC"} 
            />
            <Text 
              style={[
                styles.tabText, 
                activeTab === meal && {color: "#FFF", fontWeight: "bold"}
              ]}
            >
              {meal.charAt(0).toUpperCase() + meal.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={{ uri: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=1000&q=80" }} 
        style={styles.backgroundImage}
        blurRadius={3}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)']}
          style={styles.overlayGradient}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : null}
            style={styles.container}
            keyboardVerticalOffset={100}
          >
            <View style={styles.headerContainer}>
              <Title style={styles.header}>Meal Planner</Title>
              <Text style={styles.subheader}>Track your daily nutrition</Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading food database...</Text>
              </View>
            ) : (
              // Main content container - NOT using ScrollView due to VirtualizedList nesting issue
              <View style={styles.contentContainer}>
                {/* Tab navigation */}
                {renderTabs()}

                {/* Active meal content */}
                {renderActiveMealContent()}

                {/* Log meal button */}
                <TouchableOpacity 
                  style={styles.logButton} 
                  activeOpacity={0.8}
                  onPress={logMeal}
                >
                  <LinearGradient
                    colors={['#2ED573', '#1ABC9C']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.buttonText}>Log All Meals</Text>
                    <Ionicons name="checkmark-done" size={22} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  overlayGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 25,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subheader: {
    fontSize: 16,
    color: "#DDDDDD",
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 5,
  },
  tabText: {
    color: '#CCC',
    fontSize: 13,
    marginLeft: 5,
    fontWeight: '500',
  },
  mealCardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginBottom: 20,
    flex: 1,
  },
  mealCardHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealCardTitle: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 22,
    fontWeight: 'bold',
  },
  mealCardBody: {
    padding: 16,
    flex: 1,
  },
  selectText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#444',
  },
  multiSelectContainer: {
    marginBottom: 15,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 12,
    color: '#444',
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptySelectionText: {
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 10,
  },
  chip: {
    margin: 4,
    backgroundColor: '#F0F0F0',
  },
  chipText: {
    fontSize: 12,
  },
  logButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginTop: 10,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 25,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 10,
  },
});

export default MealTracker;