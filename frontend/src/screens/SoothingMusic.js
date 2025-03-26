import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Dimensions, 
  Animated 
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";

const { width } = Dimensions.get("window");

const TRACKS = [
  {
    title: "Yoga Nidra - Deep Relaxation",
    artist: "Gurudev Sri Sri Ravi Shankar",
    image: require("../../assets/music/nidra.jpeg"),
    source: require("../../assets/music/yoganidra.mp3")
  },
  {
    title: "Yoga Nidra - Tranquil Serenity",
    artist: "Saurabh Bothra",
    image: require("../../assets/music/evening-meditation.jpeg"),
    source: require("../../assets/music/evening-meditation.mp3")
  },
  {
    title: "Yoga Nidra - Blissful Renewal",
    artist: "Satvic Yoga",
    image: require("../../assets/music/healing-sounds.jpeg"),
    source: require("../../assets/music/healing-sounds.mp3")
  }
];

const YogaNidra = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const spinValue = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true
      })
    );
    
    if (isPlaying) {
      spin.start();
    } else {
      spin.stop();
    }

    return () => spin.stop();
  }, [isPlaying]);

  const playMusic = async () => {
    try {
      if (sound) {
        await sound.playAsync();
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          TRACKS[currentTrack].source,
          { shouldPlay: true }
        );
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          setProgress(status.positionMillis);
          setDuration(status.durationMillis);
        });

        setSound(newSound);
      }
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const pauseMusic = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const nextTrack = async () => {
    if (sound) {
      await sound.stopAsync();
      setSound(null);
    }
    setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(false);
  };

  const previousTrack = async () => {
    if (sound) {
      await sound.stopAsync();
      setSound(null);
    }
    setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(false);
  };

  const spinRotation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <LinearGradient
      colors={['#1E2A78', '#4A148C']}
      style={styles.container}
    >
      <Animated.Image 
        source={TRACKS[currentTrack].image} 
        style={[
          styles.albumCover, 
          { 
            transform: [{ rotate: spinRotation }],
            borderWidth: 5,
            borderColor: 'rgba(255,255,255,0.2)'
          }
        ]} 
      />
      
      <View style={styles.trackInfo}>
        <Text style={styles.title}>{TRACKS[currentTrack].title}</Text>
        <Text style={styles.artist}>{TRACKS[currentTrack].artist}</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={progress}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="rgba(255,255,255,0.3)"
        thumbTintColor="#FFFFFF"
      />

      <View style={styles.controls}>
        <TouchableOpacity onPress={previousTrack} style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={40} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={isPlaying ? pauseMusic : playMusic} 
          style={styles.playPauseButton}
        >
          <Ionicons 
            name={isPlaying ? "pause-circle" : "play-circle"} 
            size={80} 
            color="white" 
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={nextTrack} style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={40} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  albumCover: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24, 
    fontWeight: "bold",
    color: "white",
    textAlign: 'center',
  },
  artist: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    marginTop: 5,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    marginTop: 20,
  },
  controlButton: {
    marginHorizontal: 20,
  },
  playPauseButton: {
    marginHorizontal: 20,
  },
  slider: {
    width: width * 0.9,
    height: 40,
  }
});

export default YogaNidra;