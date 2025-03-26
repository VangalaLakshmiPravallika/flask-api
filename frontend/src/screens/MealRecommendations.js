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
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = "https://healthfitnessbackend.onrender.com"; 

const MealRecommendations = ({ navigation }) => {
  const [mealPlan, setMealPlan] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState(null);

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

  // Fetch meal plan
  const fetchMealPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/meal-plan`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMealPlan(data);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      Alert.alert('Error', 'Failed to load meal recommendations');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Fetch all data
  const fetchData = async () => {
    await fetchProfile();
    await fetchMealPlan();
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
            <Text style={styles.stat}>Calories: {safeToFixed(profile.daily_calories, 0)}</Text>
          </View>
        </View>
      )}

      {/* Refresh Control */}
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Loading Indicator */}
      {isLoading && <ActivityIndicator size="large" style={styles.loader} />}

      {/* Meal Plan */}
      {mealPlan ? (
        <FlatList
          data={[
            { ...mealPlan.breakfast, mealType: 'Breakfast' },
            { ...mealPlan.lunch, mealType: 'Lunch' },
            { ...mealPlan.dinner, mealType: 'Dinner' },
            ...mealPlan.snacks.map((snack, i) => ({ 
              ...snack, 
              mealType: `Snack ${i + 1}` 
            }))
          ]}
          renderItem={renderMealItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        !isLoading && (
          <View style={styles.emptyState}>
            <Ionicons name="nutrition-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No meal recommendations available</Text>
            <Button 
              title="Try Again" 
              onPress={fetchMealPlan} 
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
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
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