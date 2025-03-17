import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";

const qaPairs = {
  "What are the benefits of good sleep?":
    "Good sleep improves memory, boosts immunity, enhances mood, and supports overall well-being.",
  "How many hours of sleep do I need?":
    "Adults generally need 7-9 hours of sleep per night, while teenagers and children need more.",
  "What are some tips for better sleep?":
    "Maintain a consistent sleep schedule, avoid caffeine before bed, reduce screen time, and create a relaxing bedtime routine.",
  "What happens if I don't get enough sleep?":
    "Lack of sleep can lead to fatigue, difficulty concentrating, weakened immunity, and increased risk of chronic conditions.",
  "How can I fall asleep faster?":
    "Try deep breathing, meditation, avoiding heavy meals before bed, and keeping your room cool and dark.",
  "Can naps help improve sleep quality?":
    "Short naps (10-20 minutes) can boost alertness, but long naps may interfere with nighttime sleep.",
  "What foods help with sleep?":
    "Foods rich in magnesium and melatonin, like bananas, almonds, and cherries, can promote better sleep.",
  "Exit": "Goodbye! Sleep well and take care."
};

const ChatBotScreen = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! Ask me anything about sleep wellness. Type 'Exit' to quit.", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim() === "") return;

    const userMessage = { text: input, sender: "user" };
    const botResponse = {
      text: qaPairs[input] || "I'm not sure about that. Try asking something else related to sleep wellness.",
      sender: "bot"
    };

    setMessages([...messages, userMessage, botResponse]);
    setInput("");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sender === "user" ? styles.userMessage : styles.botMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me about sleep..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    padding: 10,
  },
  message: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: "#4CAF50",
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: "#2196F3",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "white",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  sendButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default ChatBotScreen;
