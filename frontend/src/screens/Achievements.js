import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions, Animated, Easing } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import * as Animatable from 'react-native-animatable';
import { Shadow } from 'react-native-shadow-2';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const AchievementsWall = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [180, 100],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.8],
    extrapolate: 'clamp'
  });

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
      delay={index * 150}
      duration={800}
      easing="ease-out-quint"
      style={styles.cardContainer}
    >
      <Shadow
        distance={15}
        startColor={'rgba(71, 118, 230, 0.15)'}
        offset={[0, 5]}
        containerViewStyle={styles.shadowContainer}
      >
        <View style={styles.achievementCard}>
          <LinearGradient
            colors={['#4776E6', '#8E54E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.achievementGradient}
          >
            <View style={styles.badgeContainer}>
              <Ionicons name="trophy" size={48} color="rgba(255,255,255,0.9)" />
              <View style={styles.badgeGlow} />
            </View>
          </LinearGradient>
          
          <View style={styles.achievementContent}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
            
            <View style={styles.userContainer}>
              <Ionicons name="person-circle" size={20} color="#7F8C8D" />
              <Text style={styles.user}>Achieved by: {item.user}</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.postButton, posting && styles.postButtonDisabled]} 
              onPress={() => postToGroup(item.title)} 
              disabled={posting}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#4776E6', '#8E54E9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.postButtonGradient}
              >
                {posting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="share-social" size={20} color="white" />
                    <Text style={styles.postButtonText}>Share Achievement</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Shadow>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.headerContainer,
          { 
            height: headerHeight,
            opacity: headerOpacity
          }
        ]}
      >
        <LinearGradient
          colors={['#4776E6', '#8E54E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <BlurView intensity={20} tint="light" style={styles.blurContainer}>
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
            <Text style={styles.subheading}>Celebrating your fitness milestones</Text>
          </BlurView>
        </LinearGradient>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4776E6" />
          <Text style={styles.loadingText}>Loading your achievements...</Text>
        </View>
      ) : achievements.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite" 
            duration={2000}
            style={styles.emptyIcon}
          >
            <LinearGradient
              colors={['#4776E6', '#8E54E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyGradient}
            >
              <Ionicons name="fitness" size={80} color="white" />
            </LinearGradient>
          </Animatable.View>
          <Text style={styles.noAchievements}>No achievements yet</Text>
          <Text style={styles.noAchievementsSubtext}>Keep pushing your limits! Your first milestone is just around the corner 💪</Text>
        </View>
      ) : (
        <Animated.FlatList
          data={achievements}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderAchievementCard}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          ListHeaderComponent={<View style={{ height: 20 }} />}
          ListFooterComponent={<View style={{ height: 40 }} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F9FC'
  },
  headerContainer: {
    width: '100%',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  headerGradient: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  maskContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center'
  },
  gradientMask: {
    flex: 1,
    width: '100%'
  },
  heading: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: 'white', 
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 10,
    marginBottom: 5
  },
  subheading: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC'
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600'
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F7F9FC'
  },
  emptyIcon: {
    marginBottom: 30,
    borderRadius: 50,
    overflow: 'hidden'
  },
  emptyGradient: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContainer: { 
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  shadowContainer: {
    marginBottom: 25,
    borderRadius: 20,
  },
  cardContainer: {
    marginBottom: 20,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 180,
  },
  achievementGradient: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  achievementContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between'
  },
  title: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#2C3E50',
    marginBottom: 8,
    letterSpacing: 0.5
  },
  description: { 
    fontSize: 14, 
    color: '#34495E',
    marginBottom: 12,
    lineHeight: 20,
    letterSpacing: 0.3
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  user: { 
    fontSize: 13, 
    color: '#7F8C8D', 
    marginLeft: 5
  },
  postButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  postButtonDisabled: {
    opacity: 0.7
  },
  postButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15
  },
  postButtonText: {
    color: 'white',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 14,
    letterSpacing: 0.3
  },
  noAchievements: { 
    fontSize: 22, 
    textAlign: 'center', 
    color: '#2C3E50', 
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  noAchievementsSubtext: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7F8C8D',
    lineHeight: 24,
    paddingHorizontal: 30
  }
});

export default AchievementsWall;