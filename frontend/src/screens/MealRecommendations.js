import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MealRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const API_BASE_URL = 'http://your-render-server-url';

  // Fetch user token and data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          // Fetch basic user data (you may need to create this endpoint)
          const response = await fetch(`${API_BASE_URL}/api/user`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, []);

  const fetchRecommendations = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/meal-recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (response.ok) {
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logRecommendation = async (foods) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/log-meal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meals: {
            'recommended': foods
          }
        }),
      });
      
      if (response.ok) {
        alert('Meal logged successfully!');
      }
    } catch (error) {
      console.error('Error logging meal:', error);
    }
  };

  if (!token) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authText}>Please login to view recommendations</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Hello, {user.name || user.email}!</Text>
          {user.bmi && (
            <Text style={styles.stats}>Your BMI: {user.bmi.toFixed(1)} • Daily Calories: {user.daily_calories.toFixed(0)}</Text>
          )}
        </View>
      )}

      <Button 
        title="Get Personalized Recommendations"
        onPress={fetchRecommendations}
        disabled={isLoading}
        color="#4CAF50"
      />

      {isLoading && <ActivityIndicator size="large" style={styles.loader} />}

      {recommendations && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Recommended Meals</Text>
          
          <FlatList
            data={recommendations.meals}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.mealCard}>
                <Text style={styles.mealTitle}>{item.mealType}</Text>
                
                <View style={styles.nutritionSummary}>
                  <Text style={styles.nutritionText}>{item.totalCalories} cal</Text>
                  <Text style={styles.nutritionText}>P: {item.protein}g</Text>
                  <Text style={styles.nutritionText}>C: {item.carbs}g</Text>
                  <Text style={styles.nutritionText}>F: {item.fats}g</Text>
                </View>
                
                <FlatList
                  data={item.foods}
                  keyExtractor={(food) => food.name}
                  renderItem={({ item: food }) => (
                    <View style={styles.foodItem}>
                      <Text>{food.name}</Text>
                      <Text>{food.calories} cal</Text>
                    </View>
                  )}
                />
                
                <TouchableOpacity 
                  style={styles.logButton}
                  onPress={() => logRecommendation(item.foods)}
                >
                  <Text style={styles.logButtonText}>Log This Meal</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
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
  },
  authText: {
    fontSize: 16,
    color: '#666',
  },
  userInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stats: {
    fontSize: 14,
    color: '#666',
  },
  loader: {
    marginVertical: 20,
  },
  recommendationsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
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
  nutritionText: {
    fontSize: 14,
    color: '#555',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  logButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  logButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MealRecommendations;