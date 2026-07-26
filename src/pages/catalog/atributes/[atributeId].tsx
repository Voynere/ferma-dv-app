import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Sections from '../../../components/Sections';
import Back from '../../../ui/Back';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Atribute: React.FC = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.Container}>
            <View style={[styles.BackBox, { paddingTop: Math.max(insets.top, 15) }]}>
                <Back onClick={() => navigation.goBack()} />
            </View>

        
                <Sections.Catalog.Atributes />
        
        </View>
    );
};

export default Atribute;

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    BackBox: {
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    Loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});