import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import LightThemeSVG from '../svg/sun';
import NightThemeSVG from '../svg/night';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Switch } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../context/redux/slice/ThemeSlice';

// FCM token saving
import { db } from '../../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import messaging from '@react-native-firebase/messaging';

// import colors
import { lightTheme, darkTheme } from '../constants/colors';


const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const isDark = useSelector((state) => state.theme.theme === 'dark');
  const colors = isDark ? darkTheme : lightTheme;
  const garageIconLight = require('../assets/garageicon.jpg');
  const garageIconDark = require('../assets/darkgarageicon.png');



  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);



  const handleLogin = async () => {
    let valid = true;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|naseeb\.com|hotmail\.com)$/i;

    // Email validation
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email');
      valid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (valid) {
      try {
        // Firebase login
        setLoading(true);
        await signInWithEmailAndPassword(auth, email.trim(), password);
        // Get FCM token
        const fcmToken = await messaging().getToken();
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          fcmToken: fcmToken,
          email: auth.currentUser.email,
          lastLogin: serverTimestamp()
        }, { merge: true });


        setLoading(false);
        navigation.navigate("Map")
      } catch (error) {
        setLoading(false);
        console.log("Login error:", error.code, error.message);
        if (error.code === "auth/invalid-credential") {
          setPasswordError("Invalid Credentials");
        } else if (error.code === "auth/too-many-requests") {
          setPasswordError("Too Many Tries, Try Again Later");
        }
      }
    }
  };


  // switch for theme management 
  const onToggleSwitch = () => {
    const newTheme = isDark ? 'light' : 'dark';
    dispatch(setTheme(newTheme));
    //  console.log(newTheme , setTheme(newTheme));
  }



  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ImageBackground
        source={require('../assets/garageback.jpg')}
        style={styles.background}
        resizeMode="cover"
        blurRadius={2}
      >

        <View style={styles.overlay}>
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
              <LightThemeSVG color={isDark ? '#fff' : '#000'} />
              <Switch value={isDark} onValueChange={onToggleSwitch} />
              <NightThemeSVG color={isDark ? '#fff' : '#000'} />
            </View>
            <Image style={styles.icon} source={isDark ? garageIconDark : garageIconLight} />

            <Text style={{ ...styles.subtitle, color: colors.text }}>Please log in to continue</Text>

            {/* Email Field */}
            <View style={{ ...styles.inputContainer, backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }}>
              <TextInput
                style={{ ...styles.input, color: colors.inputText }}
                placeholder="Email"
                placeholderTextColor={colors.inputPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            {emailError ? <Text style={{ ...styles.errorText, color: colors.error }}>{emailError}</Text> : null}

            {/* Password Field */}
            <View style={{ ...styles.inputContainer, backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }}>
              <TextInput
                style={{ ...styles.input, color: colors.inputText }}
                placeholder="Password"
                placeholderTextColor={colors.inputPlaceholder}
                secureTextEntry={!showPassword}
                autoCapitalize='none'
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>

                <Image
                  source={
                    showPassword
                      ? require('../assets/eye.png')
                      : require('../assets/crossed-eye.png')
                  }
                  style={{ width: 25, height: 20, tintColor: '#666' }}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={{ ...styles.errorText, color: colors.error }}>{passwordError}</Text> : null}

            {/* Login Button */}
            <TouchableOpacity disabled={loading} style={{ ...styles.loginButton, backgroundColor: colors.primary }} onPress={handleLogin}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ ...styles.loginText, color: colors.primaryText }}>Login</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signup}>Don't have an Account?</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    height: 120,
    width: 220,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  loginButton: {
    backgroundColor: '#4cafef',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 5,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  forgotPassword: {
    textAlign: 'center',
    color: '#4cafef',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 5,
  },
  signup: {
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '600',
    color: '#8ec541ff',
    fontSize: 14,
  },
});

export default LoginScreen;
