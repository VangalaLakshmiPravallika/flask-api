import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import HealthDataForm from "./src/screens/HealthDataForm";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import SleepTracker from "./src/screens/SleepTracker";
import AchievementsWall from "./src/screens/AchievementsWall";
import JoinGroup from "./src/screens/JoinGroup";
import PostAchievement from "./src/screens/PostAchievement";
import GroupPosts from "./src/screens/GroupPosts";
import MealTracker from "./src/screens/MealTracker";
import MealSummary from "./src/screens/MealSummary";
import MealRecommendations from "./src/screens/MealRecommendations"; // Updated import
import WorkoutPlan from "./src/screens/WorkoutPlan";
import ProgressTracker from "./src/screens/ProgressTracker";
import SoothingMusic from "./src/screens/SoothingMusic";
import StepCounter from "./src/screens/StepCounter";
import StepHistory from "./src/screens/StepHistory";
import ChatBotScreen from "./src/screens/ChatBotScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import ChallengesScreen from "./src/screens/ChallengesScreen";
import ChallengeDetailsScreen from "./src/screens/ChallengeDetailsScreen";
import LeaderboardScreen from "./src/screens/LeaderboardScreen";
import NewsScreen from "./src/screens/NewsScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ 
          headerShown: true, 
          gestureEnabled: true,
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Authentication Screens */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: false }} 
        />

        {/* Health Data Form */}
        <Stack.Screen 
          name="HealthDataForm" 
          component={HealthDataForm} 
          options={{ headerShown: false }} 
        />

        {/* Main App Screens */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ title: "Your Profile" }} 
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen} 
          options={{ title: "Edit Profile" }} 
        />

        {/* Nutrition Flow */}
        <Stack.Screen 
          name="MealTracker" 
          component={MealTracker} 
          options={{ title: "Meal Tracking" }} 
        />
        <Stack.Screen 
          name="MealSummary" 
          component={MealSummary} 
          options={{ title: "Nutrition Summary" }} 
        />
        <Stack.Screen 
          name="MealRecommendations" 
          component={MealRecommendations} 
          options={{ 
            title: "Personalized Recommendations",
            headerBackTitle: "Back to Summary"
          }} 
        />

        {/* Other Feature Screens */}
        <Stack.Screen 
          name="SleepTracker" 
          component={SleepTracker} 
          options={{ title: "Sleep Tracker" }} 
        />
        <Stack.Screen 
          name="Achievements" 
          component={AchievementsWall} 
          options={{ title: "Your Achievements" }} 
        />
        <Stack.Screen 
          name="StepCounter" 
          component={StepCounter} 
          options={{ title: "Step Counter" }} 
        />
        <Stack.Screen 
          name="JoinGroup" 
          component={JoinGroup} 
          options={{ title: "Join Community" }} 
        />
        <Stack.Screen 
          name="PostAchievement" 
          component={PostAchievement} 
          options={{ title: "Share Achievement" }} 
        />
        <Stack.Screen 
          name="GroupPosts" 
          component={GroupPosts} 
          options={{ title: "Community Posts" }} 
        />
        <Stack.Screen 
          name="WorkoutPlan" 
          component={WorkoutPlan} 
          options={{ title: "Workout Plans" }} 
        />
        <Stack.Screen 
          name="ProgressTracker" 
          component={ProgressTracker} 
          options={{ title: "Your Progress" }} 
        />
        <Stack.Screen 
          name="StepHistory" 
          component={StepHistory} 
          options={{ title: "Step History" }} 
        />
        <Stack.Screen 
          name="ChatBot" 
          component={ChatBotScreen} 
          options={{ title: "Health Assistant" }} 
        />
        <Stack.Screen 
          name="Notifications" 
          component={NotificationsScreen} 
          options={{ title: "Notifications" }} 
        />
        <Stack.Screen 
          name="SoothingMusic" 
          component={SoothingMusic} 
          options={{ title: "Relaxation Music" }} 
        />
        <Stack.Screen 
          name="Challenges" 
          component={ChallengesScreen} 
          options={{ title: "Current Challenges" }} 
        />
        <Stack.Screen 
          name="ChallengeDetails" 
          component={ChallengeDetailsScreen} 
          options={{ title: "Challenge Details" }} 
        />
        <Stack.Screen 
          name="Leaderboard" 
          component={LeaderboardScreen} 
          options={{ title: "Leaderboard" }} 
        />
        <Stack.Screen 
          name="News" 
          component={NewsScreen} 
          options={{ title: "Health News" }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}