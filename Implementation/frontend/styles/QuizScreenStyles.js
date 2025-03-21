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
        marginLeft: 'auto',
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
        width: '85%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        justifyContent: 'center',
        marginTop: 50,
        marginBottom: 50,
    },

    resultStyleName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E3A8A',
        textAlign: 'center',
    },

    resultText: {
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 28,
        color: 'black', 
        marginTop: 10,
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

});

export default QuizStyles;
