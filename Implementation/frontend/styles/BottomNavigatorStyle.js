import { StyleSheet } from "react-native";

const BottomNavigationStyles = StyleSheet.create({

    tabBar: {
        backgroundColor: '#ffffff',
        height: 60,
        paddingBottom: 10,
        paddingTop: 5,
        borderTopWidth: 0.5,
        elevation: 5,
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingTop: 5,
    }
})

export default BottomNavigationStyles;