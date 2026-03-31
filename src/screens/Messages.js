import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { darkTheme, lightTheme } from '../constants/colors';
import SendMessegeSVG from '../svg/send';
import BackSVG from '../svg/back';
import { auth, db } from '../../firebase';
import { collection, addDoc, setDoc, doc, serverTimestamp, increment, query, orderBy, onSnapshot, where, getDocs, writeBatch, updateDoc } from 'firebase/firestore';
import VoiceCallSVG from '../svg/voiceeCall';
import VideoCallSVG from '../svg/videoCall';
import { createMeeting, sendCallNotification, sendMessage } from '../config/apiservices';

const Messages = ({ route }) => {
  const navigation = useNavigation();
  const recipientEmail = route?.params?.email || 'user@example.com';
  const recipientId = route?.params?.recipientId; // Get recipient ID from params
  const flatListRef = useRef(null);

  const isDark = useSelector((state) => state.theme.theme === 'dark');
  const colors = isDark ? darkTheme : lightTheme;

  const currentUser = auth.currentUser;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // Real-time listener for messages
  useEffect(() => {
    if (!currentUser || !recipientId) return;

    const conversationId = [currentUser.uid, recipientId].sort().join('_');
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
      console.log('✅ Messages loaded:', fetchedMessages.length);
    });

    return () => unsubscribe();
  }, [currentUser, recipientId]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (!currentUser || !recipientId) return;

    const markMessagesAsRead = async () => {
      try {
        const conversationId = [currentUser.uid, recipientId].sort().join('_');
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');

        // Get all unread messages sent by the other person
        const q = query(
          messagesRef,
          where('recipientId', '==', currentUser.uid),
          where('read', '==', false)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) return;

        // Batch update all unread messages
        const batch = writeBatch(db);
        snapshot.docs.forEach(docSnapshot => {
          batch.update(docSnapshot.ref, { read: true });
        });

        // Reset unread count for current user
        batch.update(doc(db, 'conversations', conversationId), {
          [`unreadCount.${currentUser.uid}`]: 0
        });

        await batch.commit();
        console.log('✅ Marked', snapshot.docs.length, 'messages as read');
      } catch (error) {
        console.error('❌ Error marking messages as read:', error);
      }
    };

    markMessagesAsRead();
  }, [currentUser, recipientId]);



  const handleSend = async () => {
    const text = inputText.trim();

    if (!text) return;

    if (!currentUser || !recipientId) {
      alert("Missing user info");
      return;
    }

    const conversationId = [currentUser.uid, recipientId].sort().join("_");

    // Optimistic UI (optional but recommended)
    setInputText("");

    try {
      // 1. Add message
      await addDoc(
        collection(db, "conversations", conversationId, "messages"),
        {
          text,
          senderId: currentUser.uid,
          recipientId,
          timestamp: serverTimestamp(),
          read: false,
        }
      );

      // 2. Update conversation
      await setDoc(
        doc(db, "conversations", conversationId),
        {
          participants: [currentUser.uid, recipientId],
          lastMessage: text,
          lastMessageTime: serverTimestamp(),

          participantEmails: {
            [currentUser.uid]: currentUser.email || "",
            [recipientId]: recipientEmail || "",
          },

          // safer structure
          [`unreadCount.${recipientId}`]: increment(1),
        },
        { merge: true }
      );

      // 3. Send notification (reuse function)
      sendMessage({
        recipientId,
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        text,
        conversationId,
      }).catch((err) =>
        console.log("⚠️ Notification error:", err)
      );

      // 4. Scroll
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      console.log("✅ Message sent");
    } catch (error) {
      console.error("❌ Send error:", error);

      // restore text if failed
      setInputText(text);

      alert("Failed to send message");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const startCall = async (type = 'voice') => {
    if (!recipientId) return;

    try {
      const meetingId = await createMeeting();
     
      if (meetingId) {
        await sendCallNotification({
          recipientId,
          senderId: currentUser.uid,
          senderEmail: currentUser.email,
          meetingId,
          callType: type,
        });

        console.log('✅ Call notification sent, navigating to CallScreen');
        navigation.navigate('CallScreen', {
          meetingId,
          callType: type,
          recipientEmail,
        });
      } else {
        alert('Could not start call: Failed to create meeting room. Check console.');
      }
    } catch (error) {
      console.error('❌ Error starting call:', error);
      alert('Failed to start call: ' + error.message);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === currentUser?.uid;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : { backgroundColor: colors.inputBackground },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : { color: colors.text },
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              isMyMessage ? styles.myTimestamp : { color: colors.textSecondary, textAlign: 'left' },
            ]}
          >
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Email */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><BackSVG color={'#fff'} /></TouchableOpacity>
        <Text style={styles.emailText}>{recipientEmail}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginLeft: 80 }}>
          <TouchableOpacity onPress={() => startCall('voice')}><VoiceCallSVG /></TouchableOpacity>
          <TouchableOpacity onPress={() => startCall('video')}><VideoCallSVG /></TouchableOpacity>
        </View></View>

      {/* Chat Box */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Text Input Area */}
      <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={colors.inputPlaceholder}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: colors.primary },
            inputText.trim().length === 0 && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={inputText.trim().length === 0}
        >
          <SendMessegeSVG />
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4cafef',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  chatContainer: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '75%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myMessageBubble: {
    backgroundColor: '#4cafef',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#F9FAFB',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  myTimestamp: {
    color: '#fff',
    opacity: 0.7,
    textAlign: 'right',
  },
  theirTimestamp: {
    color: '#666',
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f1eeee',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    color: '#333',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  sendButton: {
    backgroundColor: '#4cafef',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default Messages;
