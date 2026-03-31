import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import InCallManager from '@videosdk.live/react-native-incallmanager';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

const IncomingCallScreen = ({ route, navigation }) => {
  const { senderId, meetingId, callType, callerName, senderEmail: initialSenderEmail } = route.params;
  const [senderEmail, setSenderEmail] = useState(initialSenderEmail);

  console.log('📞 IncomingCallScreen params:', { senderId, meetingId, callType, callerName, senderEmail: initialSenderEmail });

  // Fetch sender email from Firestore if not provided
  useEffect(() => {
    if (initialSenderEmail) {
      setSenderEmail(initialSenderEmail);
      console.log('✅ Using provided senderEmail:', initialSenderEmail);
      return;
    }

    if (senderId) {
      const fetchSenderEmail = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', senderId));
          if (userDoc.exists()) {
            const email = userDoc.data().email;
            setSenderEmail(email);
            console.log('✅ Fetched senderEmail from Firestore:', email);
          } else {
            console.warn('⚠️ User document not found for senderId:', senderId);
            setSenderEmail(senderId); // Fallback to senderId
          }
        } catch (error) {
          console.error('❌ Error fetching sender email:', error);
          setSenderEmail(senderId); // Fallback to senderId
        }
      };

      fetchSenderEmail();
    }
  }, [senderId, initialSenderEmail]);

  useEffect(() => {
    // Start ringing as soon as the screen is visible
    InCallManager.startRingtone('_BUNDLE_');

    return () => {
      // Safety: always stop ringing when leaving this screen
      InCallManager.stopRingtone();
    };
  }, []);

  const onAccept = () => {
    InCallManager.stopRingtone();
    InCallManager.start({ media: callType === 'video' ? 'video' : 'audio' });
    
    navigation.replace('CallScreen', { 
      meetingId, 
      callType:callType,
      recipientEmail:senderEmail,
      micEnabled: true,     
      camEnabled: callType === 'video' 
    });
  };

  const onDecline = () => {
    InCallManager.stopRingtone();
    navigation.goBack(); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.info}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{( senderEmail)?.charAt(0)?.toUpperCase()}</Text></View>
        <Text style={styles.callerName}>{callerName || senderEmail || 'Unknown Caller'}</Text>
        <Text style={styles.status}>Incoming {callType} call...</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.decline]} onPress={onDecline}>
          <Text style={styles.btnLabel}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.accept]} onPress={onAccept}>
          <Text style={styles.btnLabel}>Accept</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between', paddingVertical: 50 },
  info: { alignItems: 'center', marginTop: 50 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontSize: 40 },
  callerName: { color: 'white', fontSize: 28, marginTop: 20, fontWeight: 'bold' },
  callerEmail: { color: '#bbb', fontSize: 14, marginTop: 8 },
  status: { color: '#aaa', fontSize: 16, marginTop: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 50 },
  btn: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  accept: { backgroundColor: '#4CAF50' },
  decline: { backgroundColor: '#F44336' },
  btnLabel: { color: 'white', fontWeight: 'bold', marginTop: 5 }
});

export default IncomingCallScreen;