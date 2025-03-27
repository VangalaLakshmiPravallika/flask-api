import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "https://healthfitnessbackend.onrender.com/api";

const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const { challengeName } = route.params;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/get-leaderboard/${encodeURIComponent(challengeName)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [challengeName]);

  const renderItem = ({ item, index }) => (
    <View style={[
      styles.leaderboardItem,
      index === 0 && styles.firstPlace,
      index === 1 && styles.secondPlace,
      index === 2 && styles.thirdPlace
    ]}>
      <View style={styles.rankContainer}>
        {index < 3 ? (
          <Ionicons 
            name="medal" 
            size={24} 
            color={
              index === 0 ? '#FFD700' : 
              index === 1 ? '#C0C0C0' : '#CD7F32'
            } 
          />
        ) : (
          <Text style={styles.rankText}>{index + 1}</Text>
        )}
      </View>
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.progress}>{item.progress}%</Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{challengeName} Leaderboard</Text>
      </View>
      
      {leaderboard.length > 0 ? (
        <FlatList
          data={leaderboard}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={48} color="rgba(255,255,255,0.5)" />
          <Text style={styles.emptyText}>No entries yet. Be the first!</Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  firstPlace: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderColor: 'rgba(255,215,0,0.4)',
  },
  secondPlace: {
    backgroundColor: 'rgba(192,192,192,0.2)',
    borderColor: 'rgba(192,192,192,0.4)',
  },
  thirdPlace: {
    backgroundColor: 'rgba(205,127,50,0.2)',
    borderColor: 'rgba(205,127,50,0.4)',
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
  },
  username: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  progress: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    marginTop: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default LeaderboardScreen;