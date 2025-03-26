import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert, 
  AppState,
  Dimensions 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const AchievementsWall = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();

    const subscription = AppState.addEventListener("change", nextAppState => {
      console.log("App State changed:", nextAppState);
    });

    return () => {
      subscription.remove(); 
    };
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

  const clearAchievements = async () => {
    try {
      await AsyncStorage.removeItem("achievements"); 
      setAchievements([]); 
      Alert.alert("Success", "Achievement logs cleared!");
    } catch (error) {
      Alert.alert("Error", "Failed to clear achievements.");
      console.error("Error clearing achievements:", error);
    }
  };

  const renderAchievementCard = ({ item, index }) => (
    <Animatable.View 
      animation="fadeInUp"
      delay={index * 100}
      style={styles.achievementCardContainer}
    >
      <BlurView intensity={20} style={styles.achievementCard}>
        <LinearGradient
          colors={['#4A90E2', '#50C878']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.achievementCardGradient}
        >
          <View style={styles.achievementCardContent}>
            <Ionicons name="trophy" size={40} color="white" style={styles.trophyIcon} />
            <View style={styles.achievementTextContainer}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
              <Text style={styles.user}>Achieved by: {item.user}</Text>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animatable.View>
  );

  return (
    <LinearGradient
      colors={['#667EEA', '#764BA2']}
      style={styles.container}
    >
      <Animatable.View 
        animation="fadeInDown"
        style={styles.headerContainer}
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
      </Animatable.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : achievements.length === 0 ? (
        <Animatable.View 
          animation="bounceIn"
          style={styles.emptyStateContainer}
        >
          <Ionicons name="fitness" size={80} color="#FFFFFF" />
          <Text style={styles.noAchievementsText}>
            No achievements yet. Keep pushing your limits! 💪
          </Text>
        </Animatable.View>
      ) : (
        <FlatList
          data={achievements}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderAchievementCard}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Animatable.View 
        animation="fadeInUp"
        style={styles.buttonContainer}
      >
        <TouchableOpacity 
          onPress={clearAchievements} 
          style={styles.clearButton}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.clearButtonGradient}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.clearButtonText}>Clear Logs</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 100
  },
  achievementCardContainer: {
    marginBottom: 15,
  },
  achievementCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  achievementCardGradient: {
    padding: 15,
  },
  achievementCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophyIcon: {
    marginRight: 15,
  },
  achievementTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  user: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
  },
  noAchievementsText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'white',
    marginTop: 20,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  clearButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  clearButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '700',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default AchievementsWall;