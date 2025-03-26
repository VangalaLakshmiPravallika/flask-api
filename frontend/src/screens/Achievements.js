import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const AchievementsWall = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch("https://healthfitnessbackend.onrender.com/api/get-achievements", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log("Fetched Achievements:", data);
      setAchievements(data);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const postToGroup = async (badgeTitle) => {
    try {
      setPosting(true);
      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch("https://healthfitnessbackend.onrender.com/api/post-badge", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_name: "Fitness Achievers",
          badge: badgeTitle,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Badge posted to the group!");
      } else {
        Alert.alert("Error", result.error || "Failed to post badge.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not post badge.");
      console.error("Error posting badge:", error);
    } finally {
      setPosting(false);
    }
  };

  const renderAchievementCard = ({ item, index }) => (
    <Animatable.View 
      animation="fadeInUp"
      delay={index * 100}
      style={styles.achievementCardContainer}
    >
      <View style={styles.achievementCard}>
        <LinearGradient
          colors={['#FF8C00', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.achievementGradient}
        >
          <MaskedView
            maskElement={
              <View style={styles.maskContainer}>
                <Ionicons name="trophy" size={40} />
              </View>
            }
          >
            <LinearGradient
              colors={['#FFFFFF', '#F0F0F0']}
              style={styles.gradientMask}
            />
          </MaskedView>
        </LinearGradient>
        <View style={styles.achievementContent}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
          <Text style={styles.user}>Achieved by: {item.user}</Text>
          <TouchableOpacity 
            style={styles.postButton} 
            onPress={() => postToGroup(item.title)} 
            disabled={posting}
          >
            <Ionicons name="share-social" size={20} color="white" />
            <Text style={styles.postButtonText}>Share Achievement</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8C00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <MaskedView
          maskElement={
            <View style={styles.maskContainer}>
              <Text style={styles.heading}>🏆 Achievements Wall</Text>
            </View>
          }
        >
          <LinearGradient
            colors={['#FFFFFF', '#F0F0F0']}
            style={styles.gradientMask}
          />
        </MaskedView>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8C00" />
        </View>
      ) : achievements.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite" 
            style={styles.emptyIcon}
          >
            <Ionicons name="fitness" size={80} color="#FF8C00" />
          </Animatable.View>
          <Text style={styles.noAchievements}>No achievements yet. Keep pushing your limits! 💪</Text>
        </View>
      ) : (
        <FlatList
          data={achievements}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderAchievementCard}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5'
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  maskContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  gradientMask: {
    flex: 1,
    width: '100%'
  },
  heading: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: 'white', 
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 5
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5'
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5'
  },
  emptyIcon: {
    marginBottom: 20
  },
  scrollContainer: { 
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 100 
  },
  achievementCardContainer: {
    marginBottom: 15
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  achievementGradient: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  achievementContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between'
  },
  title: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#333',
    marginBottom: 10 
  },
  description: { 
    fontSize: 16, 
    color: '#666',
    marginBottom: 10 
  },
  user: { 
    fontSize: 14, 
    color: '#999', 
    fontStyle: 'italic',
    marginBottom: 15 
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF8C00',
    paddingVertical: 12,
    borderRadius: 10,
    alignSelf: 'stretch',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  postButtonText: {
    color: 'white',
    fontWeight: '700',
    marginLeft: 10,
    fontSize: 16
  },
  noAchievements: { 
    fontSize: 18, 
    textAlign: 'center', 
    color: '#666', 
    marginTop: 20,
    fontWeight: '600'
  }
});

export default AchievementsWall;