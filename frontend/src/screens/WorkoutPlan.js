import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity,
  ScrollView,
  Alert,
  AppState
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkoutPlan = () => {
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(null);
  const [bmiData, setBmiData] = useState({ bmi: null, intensity_level: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedImages, setFailedImages] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchWorkoutData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in to view recommendations');
      }

      const response = await fetch('https://healthfitnessbackend.onrender.com/api/get-personalized-weekly-plan', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch workout data');
      }

      setWeeklyWorkouts(data.weekly_workout_plan || null);
      setBmiData({
        bmi: data.bmi,
        intensity_level: data.intensity_level || ''
      });
      setError(null);
      
      // Set initial selected day to today or first available day
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = new Date().getDay();
      const todayName = days[today];
      
      if (data.weekly_workout_plan && data.weekly_workout_plan[todayName]) {
        setSelectedDay(todayName);
      } else if (data.weekly_workout_plan) {
        setSelectedDay(Object.keys(data.weekly_workout_plan)[0]);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutData();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        fetchWorkoutData();
      }
    });

    return () => subscription?.remove();
  }, []);

  const handleImageError = (id) => {
    setFailedImages(prev => ({ ...prev, [id]: true }));
  };

  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity style={styles.workoutCard}>
      {item.gifUrl && !failedImages[item.id] ? (
        <Image 
          source={{ uri: item.gifUrl }}
          style={styles.exerciseImage}
          resizeMode="cover"
          onError={() => handleImageError(item.id)}
        />
      ) : (
        <View style={styles.imageFallback}>
          <Text style={styles.fallbackText}>🏋️‍♂️</Text>
        </View>
      )}
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutName}>{item.name}</Text>
        <View style={styles.workoutMeta}>
          <Text style={styles.metaText}>{item.bodyPart}</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>{item.equipment}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDayWorkouts = () => {
    if (!selectedDay || !weeklyWorkouts || !weeklyWorkouts[selectedDay]) {
      return (
        <View style={styles.dayContainer}>
          <Text style={styles.emptyText}>No workouts available for this day</Text>
        </View>
      );
    }

    const dayWorkouts = weeklyWorkouts[selectedDay];
    
    return (
      <ScrollView style={styles.dayContainer}>
        {Object.entries(dayWorkouts).map(([session, exercises]) => {
          if (session === 'total_calories' || session === 'total_protein' || 
              session === 'total_carbs' || session === 'total_fat') {
            return null;
          }

          return (
            <View key={session} style={styles.sessionContainer}>
              <Text style={styles.sessionTitle}>
                {session.replace(/_/g, ' ').toUpperCase()}
              </Text>
              <FlatList
                data={exercises}
                renderItem={renderWorkoutItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                scrollEnabled={false}
              />
            </View>
          );
        })}
        
        {/* Daily totals */}
        <View style={styles.totalsContainer}>
          <Text style={styles.totalsTitle}>DAILY TOTALS</Text>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Calories:</Text>
            <Text style={styles.totalsValue}>{dayWorkouts.total_calories || 0}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Protein:</Text>
            <Text style={styles.totalsValue}>{dayWorkouts.total_protein || 0}g</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Carbs:</Text>
            <Text style={styles.totalsValue}>{dayWorkouts.total_carbs || 0}g</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Fat:</Text>
            <Text style={styles.totalsValue}>{dayWorkouts.total_fat || 0}g</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3E82FC" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            setFailedImages({});
            fetchWorkoutData();
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with BMI Display */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Workout Plan</Text>
        {bmiData.bmi !== null && (
          <View style={styles.bmiContainer}>
            <Text style={styles.bmiLabel}>Your BMI</Text>
            <Text style={styles.bmiValue}>
              {typeof bmiData.bmi === 'number' ? bmiData.bmi.toFixed(1) : 'N/A'}
            </Text>
            <Text style={styles.bmiCategory}>({bmiData.intensity_level})</Text>
          </View>
        )}
      </View>

      {/* Day Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.daySelector}
        contentContainerStyle={styles.daySelectorContent}
      >
        {weeklyWorkouts && Object.keys(weeklyWorkouts).map(day => (
          <TouchableOpacity
            key={day}
            style={[styles.dayButton, selectedDay === day && styles.activeDayButton]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayButtonText, selectedDay === day && styles.activeDayButtonText]}>
              {day.substring(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Workout List for Selected Day */}
      {renderDayWorkouts()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  bmiContainer: {
    alignItems: 'center',
  },
  bmiLabel: {
    fontSize: 12,
    color: '#666666',
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3E82FC',
  },
  bmiCategory: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  daySelector: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEF',
  },
  daySelectorContent: {
    paddingHorizontal: 10,
  },
  dayButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 5,
  },
  activeDayButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#3E82FC',
  },
  dayButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  activeDayButtonText: {
    color: '#3E82FC',
    fontWeight: 'bold',
  },
  dayContainer: {
    flex: 1,
    padding: 10,
  },
  sessionContainer: {
    marginBottom: 20,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3E82FC',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  imageFallback: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 40,
  },
  workoutInfo: {
    paddingHorizontal: 5,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#1A1A1A',
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666666',
    marginRight: 5,
  },
  totalsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  totalsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3E82FC',
    marginBottom: 10,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalsLabel: {
    fontSize: 14,
    color: '#666666',
  },
  totalsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
  retryButton: {
    backgroundColor: '#3E82FC',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999999',
  },
});

export default WorkoutPlan;