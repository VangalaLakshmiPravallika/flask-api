import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, Alert, TouchableOpacity, ActivityIndicator, 
  TextInput, StyleSheet, SafeAreaView, StatusBar
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "https://healthfitnessbackend.onrender.com/api";

const GroupPosts = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { group } = route.params || {};

  const [posts, setPosts] = useState([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentTexts, setCommentTexts] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadTokenAndFetchPosts = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (!storedToken) {
          Alert.alert("⚠️ Login Required", "You need to log in first!");
          navigation.navigate("LoginScreen");
        } else {
          setToken(storedToken);
          fetchGroupPosts(storedToken);
          fetchNotifications(storedToken);
        }
      } catch (error) {
        console.error("Error loading token:", error);
      }
    };
    loadTokenAndFetchPosts();
  }, []);

  const fetchGroupPosts = async (authToken) => {
    try {
      setLoading(true);
      console.log(`Fetching posts for group: ${group}`);  // Debug log
      const response = await axios.get(
        `https://healthfitnessbackend.onrender.com/api/get-group-posts/${group}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
  
      console.log("API Response:", response.data); // Debug log
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("⚠️ Error", "Failed to load posts!");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  

  const fetchNotifications = async (authToken) => {
    try {
      const response = await axios.get(`${BASE_URL}/get-notifications`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGroupPosts(token);
    fetchNotifications(token);
  };

  const likePost = async (postContent) => {
    try {
      await axios.post(
        `${BASE_URL}/like-post`,
        { group_name: group, post_content: postContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.content === postContent ? { ...post, likes: post.likes + 1 } : post
        )
      );
      fetchNotifications(token);
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to like post.");
    }
  };

  const addComment = async (postContent) => {
    const commentText = commentTexts[postContent] || "";
    if (!commentText.trim()) {
      Alert.alert("⚠️ Error", "Comment cannot be empty.");
      return;
    }
    try {
      await axios.post(
        `${BASE_URL}/comment-post`,
        { group_name: group, post_content: postContent, comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.content === postContent
            ? { ...post, comments: [...post.comments, { user: "You", text: commentText }] }
            : post
        )
      );
      setCommentTexts(prev => ({ ...prev, [postContent]: "" }));
      fetchNotifications(token);
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to add comment.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("NotificationsScreen", { notifications })}>
          <Ionicons name="notifications-outline" size={24} color="#007bff" />
          {notifications.length > 0 && <View style={styles.notificationBadge}><Text>{notifications.length}</Text></View>}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, index) => `post-${index}`}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <TouchableOpacity style={styles.newPostButton} onPress={() => navigation.navigate("PostAchievement")}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f2f5" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 16, backgroundColor: "#fff" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  newPostButton: { position: "absolute", right: 20, bottom: 20, backgroundColor: "#007bff", width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center" },
  notificationBadge: { position: "absolute", top: -2, right: -2, backgroundColor: "red", borderRadius: 10, width: 18, height: 18, justifyContent: "center", alignItems: "center" },
  listContainer: { padding: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 16, padding: 16 },
  postHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  engagementStats: { flexDirection: "row", marginBottom: 12 },
  commentsSection: { marginTop: 12, borderTopWidth: 1, borderTopColor: "#e0e0e0", paddingTop: 12 },
  addCommentSection: { marginTop: 12 },
  commentInputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#f0f2f5", borderRadius: 20, paddingHorizontal: 12 },
  commentInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#333" },
  sendCommentButton: { padding: 6 },
  emptyContainer: { alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#666", marginTop: 16 },
  emptySubtext: { fontSize: 14, color: "#888", marginTop: 6 }
});

export default GroupPosts;
