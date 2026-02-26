import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated , Image } from 'react-native';


const SplashScreen = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, { opacity: fadeAnim }]}> 
        <Image source={require('../assets/garageicon.jpg')} style={styles.icon} />
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>Garage Sale</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    height: 120,
    width: 220,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
});

export default SplashScreen;
