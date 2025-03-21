// LeaderboardScreen.js
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const LeaderboardScreen = ({ route }) => {
  const { leaderboard } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leaderboard</Text>
      <FlatList
        data={leaderboard}
        keyExtractor={(item, index) => item.email || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.leaderboardItem}>
            <Text style={styles.leaderboardText}>{item.email}</Text>
            <Text style={styles.leaderboardText}>{item.progress}%</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  leaderboardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  leaderboardText: { fontSize: 16, color: "#333" },
});

export default LeaderboardScreen;