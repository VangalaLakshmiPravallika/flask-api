import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, Alert, TouchableOpacity, ActivityIndicator,
  TextInput, StyleSheet, SafeAreaView, StatusBar, Modal
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

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
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false); 

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
      const response = await axios.get(
        `https://healthfitnessbackend.onrender.com/api/get-group-posts/${group}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setPosts(response.data);
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to load posts!");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "https://healthfitnessbackend.onrender.com/api/notifications",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(response.data);
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to fetch notifications.");
    }
  };

  const handleNotificationIconPress = async () => {
    await fetchNotifications(); 
    setIsNotificationsVisible(true); 
  };

  const handleJoinGroupPress = () => {
    navigation.navigate("JoinGroupScreen"); 
  };

  const likePost = async (postContent) => {
    try {
      await axios.post(
        "https://healthfitnessbackend.onrender.com/api/like-post",
        { group_name: group, post_content: postContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.content === postContent ? { ...post, likes: post.likes + 1 } : post
        )
      );
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to like post.");
    }
  };

  const dislikePost = async (postContent) => {
    try {
      await axios.post(
        "https://healthfitnessbackend.onrender.com/api/dislike-post",
        { group_name: group, post_content: postContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.content === postContent ? { ...post, likes: post.likes - 1 } : post
        )
      );
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to dislike post.");
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
        "https://healthfitnessbackend.onrender.com/api/comment-post",
        { group_name: group, post_content: postContent, comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.content === postContent
            ? { ...post, comments: [...post.comments, { user: "You", text: commentText }] }
            : post
        )
      );
      setCommentTexts((prev) => ({ ...prev, [postContent]: "" }));
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to add comment.");
    }
  };

  const removeComment = async (postContent, commentText) => {
    try {
      await axios.post(
        "https://healthfitnessbackend.onrender.com/api/remove-comment",
        { group_name: group, post_content: postContent, comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.content === postContent
            ? { ...post, comments: post.comments.filter((c) => c.text !== commentText) }
            : post
        )
      );
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to remove comment.");
    }
  };

  const renderPostItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.user.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.username}>{item.user}</Text>
            <Text style={styles.timestamp}>Just now</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={22} color="#555" />
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>{item.content}</Text>

      <View style={styles.engagementStats}>
        <Text style={styles.likes}>
          <Ionicons name="heart" size={16} color="#ff3b5c" /> {item.likes}
        </Text>
        <Text style={styles.commentCount}>
          <Ionicons name="chatbubble-outline" size={16} color="#555" /> {item.comments.length}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => likePost(item.content)}>
          <Ionicons name="heart-outline" size={22} color="#555" />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => dislikePost(item.content)}>
          <Ionicons name="thumbs-down-outline" size={22} color="#555" />
          <Text style={styles.actionText}>Dislike</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={22} color="#555" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {item.comments.length > 0 && (
        <View style={styles.commentsSection}>
          <Text style={styles.commentsSectionTitle}>Comments</Text>
          <FlatList
            data={item.comments}
            keyExtractor={(comment, index) => `comment-${index}`}
            renderItem={({ item: comment }) => (
              <View style={styles.commentContainer}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>{comment.user.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.commentContent}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeCommentBtn}
                  onPress={() => removeComment(item.content, comment.text)}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#888" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      <View style={styles.addCommentSection}>
        <View style={styles.commentInputContainer}>
          <TextInput
            placeholder="Write a comment..."
            value={commentTexts[item.content] || ""}
            onChangeText={(text) => setCommentTexts((prev) => ({ ...prev, [item.content]: text }))}
            style={styles.commentInput}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.sendCommentButton}
            onPress={() => addComment(item.content)}
          >
            <Ionicons name="send" size={22} color="#007bff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group}</Text>
        <TouchableOpacity onPress={handleNotificationIconPress}>
          <Ionicons name="notifications-outline" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, index) => `post-${index}`}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>Be the first to share something!</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.newPostButton} onPress={handleJoinGroupPress}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Notifications Modal */}
      <Modal
        visible={isNotificationsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsNotificationsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setIsNotificationsVisible(false)}>
                <Ionicons name="close" size={24} color="#007bff" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={notifications}
              keyExtractor={(item, index) => `notification-${index}`}
              renderItem={({ item }) => (
                <View style={styles.notificationItem}>
                  <Text style={styles.notificationText}>{item.message}</Text>
                  <Text style={styles.notificationTimestamp}>{item.timestamp}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyNotificationsText}>No new notifications.</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f2f5"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333"
  },
  notificationItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0"
  },
  notificationText: {
    fontSize: 14,
    color: "#333"
  },
  notificationTimestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 4
  },
  emptyNotificationsText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    marginTop: 10,
    color: "#007bff",
    fontSize: 16
  },
  listContainer: {
    padding: 12
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },
  username: {
    fontWeight: "600",
    fontSize: 15,
    color: "#333"
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 2
  },
  content: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    marginBottom: 12
  },
  engagementStats: {
    flexDirection: "row",
    marginBottom: 12
  },
  likes: {
    fontSize: 14,
    color: "#555",
    marginRight: 16
  },
  commentCount: {
    fontSize: 14,
    color: "#555"
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 6
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8
  },
  actionText: {
    marginLeft: 5,
    color: "#555",
    fontSize: 14
  },
  commentsSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12
  },
  commentsSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10
  },
  commentContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start"
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  commentAvatarText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600"
  },
  commentContent: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 14,
    padding: 10
  },
  commentUser: {
    fontWeight: "600",
    fontSize: 13,
    color: "#333",
    marginBottom: 2
  },
  commentText: {
    fontSize: 14,
    color: "#333"
  },
  removeCommentBtn: {
    padding: 5
  },
  addCommentSection: {
    marginTop: 12
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    paddingHorizontal: 12
  },
  commentInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333"
  },
  sendCommentButton: {
    padding: 6
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 6
  },
  newPostButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  }
});

export default GroupPosts;