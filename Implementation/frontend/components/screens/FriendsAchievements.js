// components/FriendsAchievements.js
import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const FriendsAchievements = ({ friends, currentUserId }) => {
    const [activeFriendId, setActiveFriendId] = useState(null);
    const navigation = useNavigation();
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          style={styles.scrollWrapper}
          showsVerticalScrollIndicator={true}
        >
{friends
  .sort((a, b) => (b.badgeCount || 0) - (a.badgeCount || 0))
  .map((friend, index) => {
    const isSelf = friend.id === currentUserId;
    return (
      <TouchableOpacity
        key={friend.id}
        style={[
          styles.leaderboardRow,
          index === 0 && styles.goldRow,
          index === 1 && styles.silverRow,
          index === 2 && styles.bronzeRow,
          isSelf && styles.youRow,
        ]}
        activeOpacity={0.85}
        onPress={() => {
          navigation.navigate('PublicProfile', { friendId: friend.id });
        }}
      >
        <Text style={styles.rank}>
          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
        </Text>

        {friend.profilePhotoUrl && (
          <Image
            source={{ uri: `${friend.profilePhotoUrl}?ts=${Date.now()}` }}
            style={styles.profilePhoto}
          />
        )}

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.friendName}
          >
            {isSelf ? 'You' : (friend.friendName ?? 'Friend')}
          </Text>
        </View>
        <Text style={styles.badgeCount}>🏅 {friend.badgeCount ?? 0}</Text>
      </TouchableOpacity>
    );
  })}

        </ScrollView>
      </View>
    );
    
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginTop: 16,
    borderRadius: 12,
    borderColor: '#eee',
    borderWidth: 1,
  },
  scrollContainer: {
    gap: 16,
  },
  profilePhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 12,
  },
  scrollWrapper: {
    maxHeight: 200,
  },
  friendName: {
    fontSize: 12,
    color: '#444',
    marginTop: 4,
    textAlign: 'center',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  rank: {
    width: 28,
    fontSize: 24,
    fontWeight: '700',
    color: '#263986',
    textAlign: 'center',
  },
  friendName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  badgeCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  goldRow: {
    backgroundColor: '#fffbea',
    borderLeftWidth: 4,
    borderLeftColor: '#facc15',
    shadowColor: '#facc15',
    shadowOpacity: 0.2,
  },
  
  silverRow: {
    backgroundColor: '#f3f4f6',
    borderLeftWidth: 4,
    borderLeftColor: '#a1a1aa',
    shadowColor: '#a1a1aa',
    shadowOpacity: 0.15,
  },
  
  bronzeRow: {
    backgroundColor: '#fff7ed',
    borderLeftWidth: 4,
    borderLeftColor: '#d97706',
    shadowColor: '#d97706',
    shadowOpacity: 0.12,
  },  
  youRow: {
    borderColor: '#3b82f6',
  },
  
  
});

export default FriendsAchievements;
