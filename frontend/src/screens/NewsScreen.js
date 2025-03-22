import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";

const NewsScreen = ({ route }) => {
  const { news } = route.params;

  return (
    <ScrollView style={styles.container}>
      {news.map((article, index) => (
        <View key={index} style={styles.article}>
          {article.urlToImage && (
            <Image source={{ uri: article.urlToImage }} style={styles.image} />
          )}
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.description}>{article.description}</Text>
          <Text style={styles.source}>Source: {article.source.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  article: { marginBottom: 20, padding: 10, backgroundColor: "#f9f9f9", borderRadius: 8 },
  image: { width: "100%", height: 200, borderRadius: 8, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  description: { fontSize: 14, color: "#555", marginBottom: 5 },
  source: { fontSize: 12, color: "#888" },
});

export default NewsScreen;