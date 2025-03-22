import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { WebView } from "react-native-webview";

const BASE_URL = "https://healthfitnessbackend.onrender.com/api/news"; // Replace with your backend URL

export default function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch(BASE_URL);
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.articleContainer} onPress={() => setSelectedArticle(item)}>
      <Image source={{ uri: item.urlToImage }} style={styles.articleImage} />
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle}>{item.title}</Text>
        <Text style={styles.articleDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.articlePublishedAt}>{new Date(item.publishedAt).toDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (selectedArticle) {
    return (
      <View style={styles.webViewContainer}>
        <WebView source={{ uri: selectedArticle.url }} />
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedArticle(null)}>
          <Text style={styles.backButtonText}>Back to News</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#f7f7f7", "#e0e0e0"]} style={styles.container}>
      <Text style={styles.header}>Health, Fitness & Diet News</Text>
      <FlatList
        data={news}
        renderItem={renderItem}
        keyExtractor={(item) => item.url}
        contentContainerStyle={styles.listContainer}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  articleContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articleImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  articleContent: {
    padding: 16,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  articleDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  articlePublishedAt: {
    fontSize: 12,
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  webViewContainer: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});