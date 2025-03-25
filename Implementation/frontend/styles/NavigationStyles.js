import { StyleSheet } from 'react-native';

export const navigationStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        height: 100,
        backgroundColor: "#FFF",
        borderTopWidth: 1,
        borderColor: "#DDD",
        paddingBottom: 10,
        paddingTop: 4,
    },
    navItem: {
        height: 50,
        minWidth: 50,
        padding: 5,
        marginBottom: 15,
        marginHorizontal: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    navItemActive: {
        backgroundColor: "#1E3A8A",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 30,
        minWidth: 130,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    navContent: {
        flexDirection: "column", // Default layout (icon only)
        alignItems: "center",
        justifyContent: "center",
    },
    navContentActive: {
        flexDirection: "row", // Change layout to horizontal when active
        alignItems: "center",
        justifyContent: "center",
    },
    navIcon: {
        fontSize: 20,  // Emoji size
        marginRight: 6
    },
    navText: {
        fontSize: 16,
        color: "#FFF", // White text when active
        marginTop: 3,
        marginLeft: 0,
        flexShrink: 1, // ✅ Prevents text from pushing right
        textAlign: "center"
    },
    menuContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    menuItem: {
        padding: 15,
    },
    menuText: {
        fontSize: 22,
    },
    // Modal Items
    modalContainer: {
        position: 'absolute',
        top: 120,
        bottom: 120,
        right: 0,
        width: "60%",
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        padding: 20,
        justifyContent: "center",
        borderWidth: 0.1,
        borderColor: "grey",
        shadowColor: "grey",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
    },

    // MoreMenu Styles
    moreContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        //borderWidth: 1,
    },
    // New Profile Header Card
    profileHeader: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginBottom: 20,
        backgroundColor: '#EAF0FF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    profileHeaderImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    profileHeaderName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#263986',
    },
    moreMenuItem: {
        padding: 15,
    },
    moreMenuText: {
        fontSize: 22,
    },



});
