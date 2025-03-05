import { StyleSheet, Platform } from 'react-native';

const BottomNavigatorStyles = StyleSheet.create({
    // ✅ Ensures Safe Margins for Bottom Navigation
    safeContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    tabBar: {
        backgroundColor: 'white',
        borderTopWidth: 0.5,
        borderTopColor: '#ccc',
        height: Platform.OS === 'ios' ? 80 : 60, // ✅ Extra height for iPhone X and later
        paddingBottom: Platform.OS === 'ios' ? 20 : 10, // ✅ Prevents overlap with home indicator
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default BottomNavigatorStyles;
