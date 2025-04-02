import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity, 
  Alert,
  AppState
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkoutPlan = () => {
  const [generalWorkouts, setGeneralWorkouts] = useState([]);
  const [personalizedWorkouts, setPersonalizedWorkouts] = useState([]);
  const [bmiData, setBmiData] = useState({ bmi: null, intensity_level: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('recommended');
  const [failedImages, setFailedImages] = useState({});

  const fetchWorkoutData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in to view recommendations');
      }

      // Fetch both endpoints in parallel
      const [generalResponse, personalizedResponse] = await Promise.all([
        fetch('https://healthfitnessbackend.onrender.com/api/get-recommendations', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://healthfitnessbackend.onrender.com/api/get-personalized-workouts', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [generalData, personalizedData] = await Promise.all([
        generalResponse.json(),
        personalizedResponse.json()
      ]);

      if (!generalResponse.ok || !personalizedResponse.ok) {
        throw new Error(generalData.error || personalizedData.error || 'Failed to fetch workout data');
      }

      setGeneralWorkouts(generalData.recommended_workouts || []);
      setPersonalizedWorkouts(personalizedData.recommended_workouts || []);
      setBmiData({
        bmi: personalizedData.bmi,
        intensity_level: personalizedData.intensity_level || ''
      });
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
        <Text style={styles.headerTitle}>Workout Plan</Text>
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

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'recommended' && styles.activeTab]}
          onPress={() => setActiveTab('recommended')}
        >
          <Text style={[styles.tabText, activeTab === 'recommended' && styles.activeTabText]}>
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
      </View>

      {/* Workout List */}
      <FlatList
        data={activeTab === 'recommended' ? generalWorkouts : personalizedWorkouts}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {activeTab === 'recommended' 
              ? 'No recommended workouts available' 
              : 'Complete your profile for personalized recommendations'}
          </Text>
        }
      />
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
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    margin: 10,
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
  listContent: {
    paddingBottom: 20,
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