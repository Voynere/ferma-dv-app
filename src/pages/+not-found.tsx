import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NotFoundScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Not Found</Text>
            <Text>Screen Not Found, Please go back</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
});
