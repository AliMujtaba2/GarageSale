import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { darkTheme, lightTheme } from '../constants/colors';
import BackSVG from '../svg/back';
import { auth, db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const RecievedMessege = ({ navigation }) => {
 
  const isDark = useSelector((state) => state.theme.theme === 'dark');
  const colors = isDark ? darkTheme : lightTheme;

  const [conversations, setConversations] = useState([]);
  const currentUser = auth.currentUser;

  // Real-time listener for conversations
  useEffect(() => {
    if (!currentUser) return;

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedConversations = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const otherUserId = data.participants.find(id => id !== currentUser.uid);
          
          // Get unread count for current user
          const unreadCount = data.unreadCount?.[currentUser.uid] || 0;
          
          // Get the other user's email from participantEmails map
          const otherUserEmail = data.participantEmails?.[otherUserId] || otherUserId;
          
          return {
            id: docSnapshot.id,
            email: otherUserEmail,
            lastMessage: data.lastMessage || '',
            timestamp: data.lastMessageTime?.toDate() || new Date(),
            unreadCount: unreadCount,
            recipientId: otherUserId,
          };
        })
      );
      
      // Sort by timestamp descending in JavaScript
      fetchedConversations.sort((a, b) => b.timestamp - a.timestamp);
      
      setConversations(fetchedConversations);
      console.log('✅ Conversations loaded:', fetchedConversations.length);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  

  const renderConversation = ({ item }) => {
    const hasUnread = item.unreadCount > 0;
    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          { backgroundColor: colors.background },
          hasUnread && { backgroundColor: colors.inputBackground },
        ]}
        onPress={() => navigation.navigate("Messege", { email: item.email, recipientId: item.recipientId })}
      >
        {/* Left: Avatar Circle */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.inputBackground }, hasUnread && { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: hasUnread ? '#fff' : colors.textSecondary }]}>
              {item.email.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Middle: Email and Message Preview */}
        <View style={styles.messageContent}>
          <Text style={[styles.email, { color: colors.text }]}>
            {item.email}
          </Text>
          <Text
            style={[styles.lastMessage, { color: colors.textSecondary }, hasUnread && { color: colors.text, fontWeight: '500' }]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
        </View>

        {/* Right: Time and Unread Badge */}
        <View style={styles.rightSection}>
          <Text style={[styles.timestamp, { color: colors.textSecondary }, hasUnread && { color: colors.primary, fontWeight: '600' }]}>
            {formatTime(item.timestamp)}
          </Text>
          {hasUnread && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackSVG color={'white'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No messages yet
          </Text>
          <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
            Your conversations will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#4cafef',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  listContainer: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  unreadConversation: {
    backgroundColor: '#F0F8FF',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadAvatar: {
    backgroundColor: '#4cafef',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  email: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '700',
    color: '#000',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    color: '#555',
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  unreadTimestamp: {
    color: '#4cafef',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#4cafef',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 78,
  },
});

export default RecievedMessege;
