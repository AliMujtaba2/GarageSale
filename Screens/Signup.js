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
  ActivityIndicator,
} from 'react-native';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    let valid = true;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|naseeb\.com)$/i;

    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email');
      valid = false;
    } else {
      setEmailError('');
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (confirmPassword !== password) {
      setConfirmError("Passwords don't match");
      valid = false;
    } else {
      setConfirmError('');
    }

    if (!valid) return;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setLoading(false);
      Notifier.showNotification({
        title: "Success",
        description: "Account created successfully! Please log in.",
        Component: NotifierComponents.Alert,
        componentProps: {
          alertType: "Success", // "error" | "info" | "warn"
        },
      });
      navigation.navigate('Login');
    } catch (error) {
      console.log('Signup Error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setEmailError('That email address is already in use!');
      } else if (error.code === 'auth/invalid-email') {
        setEmailError('That email address is invalid!');
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ImageBackground
        source={require('../assets/garageback.jpg')}
        style={styles.background}
        resizeMode="cover"
        blurRadius={2}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Image style={styles.icon} source={require('../assets/garageicon.jpg')} />
            <Text style={styles.subtitle}>Create a new account</Text>

            {/* Email */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            {/* Password */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
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
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#aaa"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Image
                  source={
                    showConfirmPassword
                      ? require('../assets/eye.png')
                      : require('../assets/crossed-eye.png')
                  }
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
            {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}

            {/* Signup Button */}
            <TouchableOpacity disabled={loading} style={styles.loginButton} onPress={handleSignup}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Already have account */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.forgotPassword}>Already have an account?</Text>
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
  icon: {
    height: 120,
    width: 220,
    resizeMode: 'contain',
    alignSelf: 'center',
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
    color: '#333',
  },
  eyeIcon: {
    width: 25,
    height: 20,
    tintColor: '#666',
  },
  loginButton: {
    backgroundColor: '#4cafef',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 15,
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
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 5,
  },
});
export default SignupScreen;
