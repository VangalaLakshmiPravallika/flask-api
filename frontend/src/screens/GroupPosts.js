import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, Alert, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";

const GroupPosts = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { group } = route.params || {};

  const [posts, setPosts] = useState([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentTexts, setCommentTexts] = useState({});

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
    }
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{group} - Posts</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.user}>{item.user}</Text>
              <Text style={styles.content}>{item.content}</Text>
              <Text style={styles.likes}>❤️ {item.likes} Likes</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.likeButton} onPress={() => likePost(item.content)}>
                  <Text style={styles.buttonText}>👍 Like</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dislikeButton} onPress={() => dislikePost(item.content)}>
                  <Text style={styles.buttonText}>👎 Dislike</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="Write a comment..."
                value={commentTexts[item.content] || ""}
                onChangeText={(text) => setCommentTexts((prev) => ({ ...prev, [item.content]: text }))}
                style={styles.input}
              />
              <TouchableOpacity style={styles.commentButton} onPress={() => addComment(item.content)}>
                <Text style={styles.buttonText}>💬 Add Comment</Text>
              </TouchableOpacity>

              <FlatList
                data={item.comments}
                keyExtractor={(cmt, index) => index.toString()}
                renderItem={({ item: comment }) => (
                  <View style={styles.commentRow}>
                    <Text style={styles.comment}>🗨 {comment.user}: {comment.text}</Text>
                    <TouchableOpacity onPress={() => removeComment(item.content, comment.text)}>
                      <Text style={styles.removeCommentText}>❌</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#ADD8E6",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
  },
  user: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#007bff",
  },
  content: {
    fontSize: 15,
    marginVertical: 5,
    color: "#333",
  },
  likes: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
});

export default GroupPosts;
