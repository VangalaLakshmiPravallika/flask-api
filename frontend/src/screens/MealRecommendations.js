import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Button, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  RefreshControl,
  SectionList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = "https://healthfitnessbackend.onrender.com"; 

const MealRecommendations = ({ navigation }) => {
  const [weeklyMealPlan, setWeeklyMealPlan] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});

  // Load token and initial data
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('authToken');
      setToken(storedToken);
      if (!storedToken) {
        navigation.navigate('Login');
      }
    };
    loadToken();
  }, []);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/get-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  // Fetch weekly meal plan
  const fetchWeeklyMealPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/weekly-meal-plan`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setWeeklyMealPlan(data);
      // Initialize expanded days (none expanded by default)
      const initialExpanded = {};
      Object.keys(data).forEach(day => {
        initialExpanded[day] = false;
      });
      setExpandedDays(initialExpanded);
    } catch (error) {
      console.error('Error fetching weekly meal plan:', error);
      Alert.alert('Error', 'Failed to load weekly meal recommendations');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Toggle day expansion
  const toggleDayExpansion = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Fetch all data
  const fetchData = async () => {
    await fetchProfile();
    await fetchWeeklyMealPlan();
  };

  // Load data when token changes
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Format numbers safely
  const safeToFixed = (value, digits = 0) => {
    const num = parseFloat(value);
    return isNaN(num) ? 'N/A' : num.toFixed(digits);
  };

  // Render meal item
  const renderMealItem = ({ item }) => (
    <View style={styles.mealCard}>
      <Text style={styles.mealTitle}>{item.mealType || 'Meal'}</Text>
      
      <View style={styles.nutritionSummary}>
        <Text>{safeToFixed(item.total_calories)} cal</Text>
        <Text>P: {safeToFixed(item.total_protein)}g</Text>
        <Text>C: {safeToFixed(item.total_carbs)}g</Text>
        <Text>F: {safeToFixed(item.total_fat)}g</Text>
      </View>
      
      <FlatList
        data={item.foods}
        keyExtractor={(food) => food.name}
        renderItem={({ item: food }) => (
          <View style={styles.foodItem}>
            <Text>{food.name}</Text>
            <Text>{safeToFixed(food.calories)} cal</Text>
          </View>
        )}
      />
    </View>
  );

  // Render day section
const renderDaySection = ({ section }) => (
  <TouchableOpacity 
    style={styles.dayHeader} 
    onPress={() => toggleDayExpansion(section.day)}
  >
    <Text style={styles.dayHeaderText}>{section.day}</Text>
    <Text style={styles.dayCalories}>
      {safeToFixed(section.data.reduce((sum, meal) => sum + (meal.total_calories || 0), 0))} cal
    </Text>
    <Ionicons 
      name={expandedDays[section.day] ? "chevron-up" : "chevron-down"} 
      size={20} 
      color="#666" 
    />
  </TouchableOpacity>
);


  // Prepare section data for SectionList
  const prepareSectionData = () => {
    if (!weeklyMealPlan) return [];
    
    return Object.keys(weeklyMealPlan).map(day => {
      const dayMeals = weeklyMealPlan[day];
      return {
        day,
        data: [
          { ...dayMeals.breakfast, mealType: 'Breakfast' },
          { ...dayMeals.lunch, mealType: 'Lunch' },
          { ...dayMeals.dinner, mealType: 'Dinner' },
          ...dayMeals.snacks.map((snack, i) => ({ 
            ...snack, 
            mealType: `Snack ${i + 1}` 
          }))
        ]
      };
    });
  };

  if (!token) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authText}>Please login to view recommendations</Text>
        <Button 
          title="Go to Login" 
          onPress={() => navigation.navigate('Login')} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Info */}
      {profile && (
        <View style={styles.profileContainer}>
          <Text style={styles.profileName}>{profile.name || profile.email}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.stat}>BMI: {safeToFixed(profile.bmi, 1)}</Text>
            <Text style={styles.stat}>Daily Calories: {safeToFixed(profile.daily_calories, 0)}</Text>
          </View>
        </View>
      )}

      {/* Loading Indicator */}
      {isLoading && <ActivityIndicator size="large" style={styles.loader} />}

      {/* Weekly Meal Plan */}
      {weeklyMealPlan ? (
        <SectionList
          sections={prepareSectionData()}
          keyExtractor={(item, index) => item.mealType + index}
          renderItem={({ item }) => (expandedDays[item.day] ? renderMealItem({ item }) : null)}
          renderSectionHeader={renderDaySection}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        !isLoading && (
          <View style={styles.emptyState}>
            <Ionicons name="nutrition-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No meal recommendations available</Text>
            <Button 
              title="Try Again" 
              onPress={fetchWeeklyMealPlan} 
              color="#4CAF50"
            />
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  profileContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    fontSize: 16,
    color: '#666',
  },
  loader: {
    marginVertical: 20,
  },
  dayHeader: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  dayHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  dayCalories: {
    fontSize: 14,
    color: '#666',
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2E7D32',
  },
  nutritionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 20,
    textAlign: 'center',
  },
});

export default MealRecommendations;