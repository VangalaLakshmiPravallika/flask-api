import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkoutPlan = () => {
  const [workouts, setWorkouts] = useState(null);
  const [personalizedWorkouts, setPersonalizedWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('recommendations');

  const fetchWorkoutData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in to view recommendations');
      }

      // Fetch general recommendations
      const recommendationsResponse = await fetch('https://healthfitnessbackend.onrender.com/api/get-recommendations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      // Fetch personalized workouts
      const personalizedResponse = await fetch('https://healthfitnessbackend.onrender.com/api/get-personalized-workouts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!recommendationsResponse.ok || !personalizedResponse.ok) {
        throw new Error('Failed to fetch workout data');
      }

      const recommendationsData = await recommendationsResponse.json();
      const personalizedData = await personalizedResponse.json();

      setWorkouts(recommendationsData);
      setPersonalizedWorkouts(personalizedData.recommended_workouts || []);
      setError(null);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutData();
  }, []);

  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity style={styles.workoutCard}>
      <Image 
        source={{ uri: item.gifUrl || 'https://via.placeholder.com/150' }} 
        style={styles.exerciseImage}
        resizeMode="cover"
      />
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

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3E82FC" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              fetchWorkoutData();
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === 'recommendations' && workouts) {
      return (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <FlatList
            data={workouts.recommended_workouts}
            renderItem={renderWorkoutItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.workoutGrid}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }

    if (activeTab === 'personalized' && personalizedWorkouts) {
      return (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Personalized For You</Text>
          {personalizedWorkouts.length > 0 ? (
            <FlatList
              data={personalizedWorkouts}
              renderItem={renderWorkoutItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.workoutGrid}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.emptyText}>No personalized workouts available yet</Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          {activeTab === 'myPlan' ? 'Your Workout Plan' : 'Your Progress'}
        </Text>
        <Text style={styles.emptyText}>
          {activeTab === 'myPlan' 
            ? 'Your personalized plan will appear here' 
            : 'Track your fitness journey here'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fitness Dashboard</Text>
        {workouts && (
          <View style={styles.bmiContainer}>
            <Text style={styles.bmiLabel}>Your BMI</Text>
            <Text style={styles.bmiValue}>{workouts.bmi.toFixed(1)}</Text>
            <Text style={styles.bmiCategory}>({workouts.intensity_level})</Text>
          </View>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'recommendations' && styles.activeTab]}
          onPress={() => setActiveTab('recommendations')}
        >
          <Text style={[styles.tabText, activeTab === 'recommendations' && styles.activeTabText]}>
            Recommended
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'personalized' && styles.activeTab]}
          onPress={() => setActiveTab('personalized')}
        >
          <Text style={[styles.tabText, activeTab === 'personalized' && styles.activeTabText]}>
            Personalized
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
          onPress={() => setActiveTab('progress')}
        >
          <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEF',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#3E82FC',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#3E82FC',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3E82FC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1A1A1A',
  },
  workoutGrid: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  workoutCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseImage: {
    width: '100%',
    height: 120,
  },
  workoutInfo: {
    padding: 10,
  },
  workoutName: {
    fontSize: 14,
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
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    marginTop: 20,
  },
});

export default WorkoutPlan;