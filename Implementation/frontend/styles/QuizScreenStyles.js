import { StyleSheet } from "react-native";

const QuizStyles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15,
        backgroundColor: 'white',
    },

    questionTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1E3A8A',
        alignSelf: 'flex-start',
        marginHorizontal: 28,
        marginTop: 20,
    },

    question: {
        fontSize: 18,
        color: 'black',
        alignSelf: 'flex-start',
        marginHorizontal: 30,
        paddingVertical: 10, 
    },

    optionsContainer: {
        alignSelf: 'center',
        width: '100%',
        marginBottom: 20,
    },

    optionButton: {
        backgroundColor: '#F2F2F2',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '90%',
        alignSelf: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#1E3A8A',
    },

    selectedOptionButton: {
        backgroundColor: '#1E3A8A',
        borderWidth: 2,
        borderColor: '#17A2B8',
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
    },

    optionText: {
        fontSize: 16,
        color: 'black',
    },

    selectedOptionText: {
        color: 'white',
        fontWeight: 'bold',
    },

    checkmarkIcon: {
        marginLeft: 10,
        marginRight: 5,
        alignSelf: 'center',
    },

    buttonNav: {
        backgroundColor: 'transparent',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        minWidth: '25%',
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#1E3A8A',
    },

    buttonText: {
        color: '#1E3A8A',
        fontSize: 16,
        fontWeight: 'bold',
    },

    buttonNext: {
        backgroundColor: '#FF6F00',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        margin: 15,
        minWidth: '45%',
        alignSelf: 'flex-end',
        marginEnd: 30,
        flexDirection: 'row',
    },

    buttonNextText: {
        color: '#F2F2F2',
        fontSize: 16,
        fontWeight: 'bold',
    },

    progressContainer: {
        width: '85%',
        height: 10,
        backgroundColor: '#F2F2F2',
        borderRadius: 5,
        overflow: 'hidden',
        alignSelf: 'center',
        marginTop: 20,
    },
    
    progressBar: {
        height: '100%',
        backgroundColor: '#1E3A8A',
        borderRadius: 5,
    },

    resultContainer: {
        width: '90%',
        backgroundColor: '#1E3A8A',
        padding: 30,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
        justifyContent: 'center',
        marginTop: 40,
        marginBottom: 50,
        borderWidth: 1,
        borderColor: '#E6E6E6',
    },
    

    resultStyleName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFDD57',
        textAlign: 'center',
        marginVertical: 5,
    },
    
    resultText: {
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 26,
        color: 'white',
        marginBottom: 10,
    },
    

    retakeQuizButton: {
        backgroundColor: '#FF6F00',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        marginTop: 40,
        minWidth: '40%',
    },

    retakeQuizButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    disabledButton: {
        backgroundColor: '#f2f2f2',
        borderWidth: 1,
        borderColor: '#ccc',
    },

    disabledButtonText: {
        color: 'black',
        fontWeight: 'regular',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
      },
      
    loadingText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E3A8A',
        marginBottom: 20,
    },
    resultEmoji: {
        fontSize: 70,
        marginBottom: 10,
    },
    resumeOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
      },
      
      resumeModal: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 20,
        width: '85%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
      },
      
      resumeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E3A8A',
        marginBottom: 12,
        textAlign: 'center',
      },
      
      resumeMessage: {
        fontSize: 14,
        color: 'black',
        textAlign: 'center',
        marginBottom: 20,
      },
      
      resumeButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: 12,
      },
      modalButtonPrimary: {
        backgroundColor: '#FF6F00',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      },
      
      modalButtonPrimaryText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
      },
      
      modalButtonSecondary: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#1E3A8A',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      },
      
      modalButtonSecondaryText: {
        color: '#1E3A8A',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
      },
      optionContent: {
        flexDirection: 'row',
        alignItems: 'center',           // ✅ ensures vertical alignment
        justifyContent: 'space-between',
        width: '100%',
        paddingLeft: 10,
        paddingRight: 20,
      },
        
    
});

export default QuizStyles;
