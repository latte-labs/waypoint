// components/DayCard.js
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

const parseToSortableTime = (timeStr) => {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
  if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const DayCard = memo(({ item, onPress, onLongPress, onEdit, renderRightActions, onLayout }) => {
  const totalEstimatedCost = item.activities?.reduce((sum, activity) => {
    return sum + (activity.estimated_cost ? parseFloat(activity.estimated_cost) : 0);
  }, 0) || 0;

  return (
    <Swipeable
      overshootLeft={false}
      overshootRight={false}
      renderRightActions={() => renderRightActions(item.id)}
    >
      <TouchableOpacity 
        onPress={() => onPress(item.id)} 
        onLongPress={onLongPress} 
        style={styles.dayCard}
        onLayout={onLayout}
      >
        <Text style={styles.dayTitle}>{item.title}</Text>
        <Text style={styles.dayDate}>
          {new Date(item.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        <Text style={styles.totalCostText}>
          Est. Cost: ${totalEstimatedCost.toFixed(2)}
        </Text>

        {item.activities && item.activities.length > 0 ? (
          [...item.activities]
            .sort((a, b) => parseToSortableTime(a.time).localeCompare(parseToSortableTime(b.time)))
            .map(activity => (
              <View key={activity.id} style={styles.activityCard}>
                <Text style={styles.activityTime}>{activity.time}</Text>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityLocation}>📍 {activity.location}</Text>
              </View>
            ))
        ) : (
          <Text style={styles.noActivities}>No activities planned.</Text>
        )}

        <TouchableOpacity 
          style={styles.editIconContainer}
          onPress={() => onEdit(item.id)}
        >
          <Icon name="pencil" size={16} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Swipeable>
  );
});

const styles = StyleSheet.create({
  dayCard: { 
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  dayDate: { fontSize: 14, color: '#555', marginBottom: 10 },
  totalCostText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  activityCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#007bff',
    width: '100%',
    alignSelf: 'center',
  },
  activityTime: { fontSize: 14, fontWeight: 'bold', color: '#007bff' },
  activityName: { fontSize: 16, fontWeight: '600', color: '#222' },
  activityLocation: { fontSize: 14, color: '#555' },
  noActivities: { fontSize: 14, color: '#888', fontStyle: 'italic' },
  editIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'green',
    borderRadius: 12,
    padding: 4,
    zIndex: 1,
  },
});

export default DayCard;
