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
        width: "70%",
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
    // profileHeader: {
    //     // width: '100%',
    //     // flexDirection: 'row',
    //     alignItems: 'center',
    //     padding: 10,
    //     backgroundColor: 'rgb(243, 243, 243)',
    //     borderRadius: 40,
    //     borderWidth: 0.1,
    //     borderColor: "grey",
    //     shadowColor: "grey",
    //     shadowOffset: { width: 0, height: -2 },
    //     shadowOpacity: 0.5,
    //     shadowRadius: 2,
    //     justifyContent: 'center'
    // },
    profileHeaderImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
        borderWidth: 0.5,
    },
    profileHeaderName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E3A8A',
    },
    moreMenuItem: {
        padding: 15,
        alignSelf: 'flex-start',
        marginStart: 15,
    },
    moreMenuText: {
        fontSize: 22,
    },
    profileHeaderShadow: {
        marginBottom: 20,
      },

});
