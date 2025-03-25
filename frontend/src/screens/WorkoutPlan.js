import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

const FitnessDashboard = () => {
  const [workouts, setWorkouts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken } = useAuth();
  const [activeTab, setActiveTab] = useState('recommendations');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://healthfitnessbackend.onrender.com/api/get-personalized-workouts', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch data');
        }
        
        setWorkouts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [authToken]);

  const renderWorkout = ({ item }) => (
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with BMI Display */}
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

      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'recommendations' && styles.activeTab]}
          onPress={() => setActiveTab('recommendations')}
        >
          <Text style={[styles.tabText, activeTab === 'recommendations' && styles.activeTabText]}>Recommendations</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'myPlan' && styles.activeTab]}
          onPress={() => setActiveTab('myPlan')}
        >
          <Text style={[styles.tabText, activeTab === 'myPlan' && styles.activeTabText]}>My Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
          onPress={() => setActiveTab('progress')}
        >
          <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      {activeTab === 'recommendations' && workouts && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <FlatList
            data={workouts.recommended_workouts}
            renderItem={renderWorkout}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.workoutGrid}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {activeTab === 'myPlan' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Your Workout Plan</Text>
          <Text style={styles.emptyText}>Your personalized plan will appear here</Text>
        </View>
      )}

      {activeTab === 'progress' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <Text style={styles.emptyText}>Track your fitness journey here</Text>
        </View>
      )}
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default WorkoutPlan;