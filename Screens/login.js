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
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';



const LoginScreen = ({ navigation }) => {
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
      setLoading(false);
      navigation.navigate("Map")
    } catch (error) {
      setLoading(false);
      console.log("Login error:", error.code, error.message);
      if (error.code === "auth/invalid-credential") {
        setPasswordError("Invalid Credentials");
      } else if (error.code === "auth/too-many-requests") {
        setPasswordError("Too Many Tries, Try Again Later");}
    }
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
            <Text style={styles.subtitle}>Please log in to continue</Text>

            {/* Email Field */}
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

            {/* Password Field */}
            <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry={!showPassword}
        autoCapitalize='none'
        value={password}
        onChangeText={setPassword}
      />
     <TouchableOpacity  onPress={() => setShowPassword(!showPassword)}>
   
  <Image
    source={
      showPassword
        ? require('../assets/eye.png')
        : require('../assets/crossed-eye.png')
    }
    style={{ width: 25 ,  height: 20, tintColor: '#666' }}
  />
</TouchableOpacity>
    </View>
       {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            {/* Login Button */}
            <TouchableOpacity disabled={loading} style={styles.loginButton} onPress={handleLogin}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginText}>Login</Text>
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
    color: '#333',
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
