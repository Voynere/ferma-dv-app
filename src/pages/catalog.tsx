import React, { useRef } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Header from '../components/Header';
import Catalog from '../components/Sections/Home/Catalog';

export default function CatalogScreen() {
    const scrollRef = useRef<ScrollView>(null);

    return (
        <View style={styles.Container}>
            <ScrollView ref={scrollRef} contentContainerStyle={styles.ContentContainer}>
                <Header scrollRef={scrollRef} />
                <Catalog showHeader={false} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    ContentContainer: {
        paddingBottom: 100, // место для нижней навигации
    },
});
