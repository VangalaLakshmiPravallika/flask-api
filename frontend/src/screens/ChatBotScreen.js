import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ScrollView,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from "react-native";

import Icon from 'react-native-vector-icons/Feather';

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

// Map questions to their respective icons
const questionIcons = {
  "What are the benefits of good sleep?": "moon",
  "How many hours of sleep do I need?": "clock",
  "What are some tips for better sleep?": "zap",
  "What happens if I don't get enough sleep?": "activity",
  "How can I fall asleep faster?": "fast-forward",
  "Can naps help improve sleep quality?": "coffee",
  "What foods help with sleep?": "apple",
  "Exit": "log-out"
};

const ChatBotScreen = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your Sleep Wellness Assistant. How can I help you today? Tap on a question or type your own.", sender: "bot" },
  ]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const flatListRef = useRef(null);
  const questionsScrollRef = useRef(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleQuestionSelection = (question) => {
    const userMessage = { text: question, sender: "user" };
    const botResponse = { text: qaPairs[question] || "I don't have an answer for that specific question yet. Please try another question about sleep wellness.", sender: "bot" };

    setMessages([...messages, userMessage, botResponse]);

    // If "Exit" is selected, clear messages after a short delay
    if (question === "Exit") {
      setTimeout(() => setMessages([{ text: "Hello! I'm your Sleep Wellness Assistant. How can I help you today? Tap on a question or type your own.", sender: "bot" }]), 2000);
    }
  };

  const handleCustomQuestion = () => {
    if (customQuestion.trim() === "") return;
    
    // Look for closest match in qaPairs or provide a default response
    let bestMatch = "I don't have an answer for that specific question yet. Please try one of the suggested questions about sleep wellness.";
    let matchFound = false;
    
    Object.keys(qaPairs).forEach(question => {
      if (question !== "Exit" && customQuestion.toLowerCase().includes(question.toLowerCase().slice(0, 5))) {
        bestMatch = qaPairs[question];
        matchFound = true;
      }
    });
    
    const userMessage = { text: customQuestion, sender: "user" };
    const botResponse = { text: bestMatch, sender: "bot" };
    
    setMessages([...messages, userMessage, botResponse]);
    setCustomQuestion("");
  };

  // Format timestamp for messages
  const getTimeStamp = () => {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="moon" size={24} color="#4361EE" />
        <Text style={styles.headerTitle}>Sleep Wellness Assistant</Text>
      </View>
      
      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "chat" && styles.activeTab]} 
          onPress={() => setActiveTab("chat")}
        >
          <Icon name="message-circle" size={20} color={activeTab === "chat" ? "#4361EE" : "#555"} />
          <Text style={[styles.tabText, activeTab === "chat" && styles.activeTabText]}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === "home" && styles.activeTab]} 
          onPress={() => setActiveTab("home")}
        >
          <Icon name="home" size={20} color={activeTab === "home" ? "#4361EE" : "#555"} />
          <Text style={[styles.tabText, activeTab === "home" && styles.activeTabText]}>Topics</Text>
        </TouchableOpacity>
      </View>
      
      {/* Main Content Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.contentContainer}
        keyboardVerticalOffset={90}
      >
        {activeTab === "chat" && (
          <>
            {/* Chat History */}
            <FlatList
              ref={flatListRef}
              data={messages}
              style={styles.messagesList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={[styles.messageRow, item.sender === "user" ? styles.userMessageRow : styles.botMessageRow]}>
                  {item.sender === "bot" && (
                    <View style={styles.botAvatar}>
                      <Icon name="moon" size={16} color="#fff" />
                    </View>
                  )}
                  <View style={[styles.message, item.sender === "user" ? styles.userMessage : styles.botMessage]}>
                    <Text style={[styles.messageText, item.sender === "user" ? styles.userMessageText : styles.botMessageText]}>
                      {item.text}
                    </Text>
                    <Text style={styles.timestamp}>{getTimeStamp()}</Text>
                  </View>
                  {item.sender === "user" && (
                    <View style={styles.userAvatar}>
                      <Icon name="user" size={16} color="#fff" />
                    </View>
                  )}
                </View>
              )}
            />

            {/* Quick Question Chips */}
            <ScrollView 
              ref={questionsScrollRef}
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.chipContainer}
              contentContainerStyle={styles.chipContentContainer}
              onContentSizeChange={() => questionsScrollRef.current.scrollToEnd({ animated: true })}
            >
              {Object.keys(qaPairs).map((question, index) => {
                const iconName = questionIcons[question];
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.chip} 
                    onPress={() => handleQuestionSelection(question)}
                  >
                    <Icon name={iconName} size={16} color="#4361EE" />
                    <Text style={styles.chipText}>{question.length > 20 ? question.substring(0, 18) + '...' : question}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask about sleep..."
                value={customQuestion}
                onChangeText={setCustomQuestion}
                onSubmitEditing={handleCustomQuestion}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleCustomQuestion}>
                <Icon name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        )}
        
        {activeTab === "home" && (
          <ScrollView contentContainerStyle={styles.questionContainer}>
            <Text style={styles.sectionTitle}>All Sleep Topics</Text>
            {Object.keys(qaPairs).map((question, index) => {
              const iconName = questionIcons[question];
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.questionButton} 
                  onPress={() => {
                    handleQuestionSelection(question);
                    setActiveTab("chat");
                  }}
                >
                  <Icon name={iconName} size={20} color="#fff" style={styles.questionIcon} />
                  <Text style={styles.questionText}>{question}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8F9FA", 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4361EE",
  },
  tabText: {
    marginLeft: 5,
    color: "#555",
    fontSize: 14,
  },
  activeTabText: {
    color: "#4361EE",
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  botMessageRow: {
    justifyContent: "flex-start",
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4361EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3CCF4E",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  message: { 
    padding: 12, 
    borderRadius: 16, 
    maxWidth: "70%" 
  },
  userMessage: { 
    backgroundColor: "#3CCF4E", 
    borderBottomRightRadius: 4,
  },
  botMessage: { 
    backgroundColor: "#fff", 
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  messageText: { 
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#fff",
  },
  botMessageText: {
    color: "#333",
  },
  timestamp: {
    fontSize: 10,
    color: "rgba(0,0,0,0.5)",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  chipContainer: {
    maxHeight: 60,
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  chipContentContainer: {
    paddingRight: 30
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e8ff",
  },
  chipText: {
    fontSize: 12,
    color: "#4361EE",
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#F1F3F4",
    borderRadius: 22,
    paddingHorizontal: 16,
    marginRight: 8,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4361EE",
    alignItems: "center",
    justifyContent: "center",
  },
  questionContainer: { 
    padding: 16,
    backgroundColor: "#F8F9FA",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  questionButton: { 
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4361EE", 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  questionIcon: {
    marginRight: 12,
  },
  questionText: { 
    color: "white", 
    fontSize: 15, 
    fontWeight: "500",
    flex: 1,
  },
});

export default ChatBotScreen;