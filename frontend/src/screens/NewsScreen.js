import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, Alert } from "react-native";

const NewsScreen = ({ route }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch news from the backend
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("https://healthfitnessbackend.onrender.com/api/news");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const newsData = await response.json();
        setArticles(newsData);
      } catch (error) {
        console.error("Error fetching news:", error);
        setError(error.message);
        Alert.alert("Error", "Failed to fetch news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Render each news article
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.article}
      onPress={() => Linking.openURL(item.url)}
    >
      {item.urlToImage && (
        <Image source={{ uri: item.urlToImage }} style={styles.image} />
      )}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.source}>{item.source.name}</Text>
    </TouchableOpacity>
  );

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading news...</Text>
      </View>
    );
  }

  // Show error message if fetching fails
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  // Render the list of news articles
  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        renderItem={renderItem}
        keyExtractor={(item) => item.url}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  article: { marginBottom: 20, padding: 10, backgroundColor: "#f9f9f9", borderRadius: 8 },
  image: { width: "100%", height: 200, borderRadius: 8, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  description: { fontSize: 14, color: "#555", marginBottom: 5 },
  source: { fontSize: 12, color: "#888" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#007bff" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red" },
});

export default NewsScreen;