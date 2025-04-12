// components/FriendsAchievements.js
import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const FriendsAchievements = ({ friends }) => {
    const [activeFriendId, setActiveFriendId] = useState(null);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollWrapper}
        showsVerticalScrollIndicator={true}
      >
        {friends.map((friend) => (
          <View key={friend.id} style={styles.friendRow}>
            {/* Profile Photo */}
            <TouchableOpacity
                onLongPress={() => setActiveFriendId(friend.id)}
                onPressOut={() => setActiveFriendId(null)}
                delayLongPress={300}
                activeOpacity={0.8}
                >
                <Image
                    source={{ uri: `${friend.profilePhotoUrl}?ts=${Date.now()}` }}
                    style={styles.profilePhoto}
                />
                {activeFriendId === friend.id && (
                    <Text style={styles.friendName}>{friend.friendName ?? 'Friend'}</Text>
                )}
            </TouchableOpacity>


            {/* Badges Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesScroll}
            >
              {friend.badges.map((badge, index) => (
                <Image
                  key={index}
                  source={badge.image}
                  style={styles.badgeIcon}
                />
              ))}
            </ScrollView>
          </View>
        ))}
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
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 12,
  },
  badgesScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  scrollWrapper: {
    maxHeight: 128,
  },
  friendName: {
    fontSize: 12,
    color: '#444',
    marginTop: 4,
    textAlign: 'center',
  },
  
});

export default FriendsAchievements;
