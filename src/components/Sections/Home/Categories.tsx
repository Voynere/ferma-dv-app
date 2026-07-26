import { StyleSheet, View } from 'react-native'
import React, { useRef, useCallback } from 'react'
import Row from '../../Row'
import TouchBox from '../../TouchBox'
import { categoriesList } from '../../../constants'
import Txt from '../../../ui/Text'

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../RootLayout';
import useCatalogStore from '../../../store/catalog';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Categories = () => {
    const navigation = useNavigation<NavigationProp>();
    const { isLoading } = useCatalogStore();
    const lastClickTime = useRef(0);

    const handleClick = useCallback((id: string) => {
        const now = Date.now();
        if (isLoading || now - lastClickTime.current < 1000) {
            return;
        }
        lastClickTime.current = now;
        navigation.navigate('atributes', { id });
    }, [isLoading, navigation]);

    return (
        <View style={styles.Categories}>
            <Row>
                {categoriesList.slice(0, 3).map((item, index) => (
                    <TouchBox
                        padding={16}
                        height={62}
                        isFull
                        key={index}
                        onClick={() => handleClick(item.id)}
                    >
                        <View style={styles.Box}>
                            <item.icon />
                            <Txt>{item.name}</Txt>
                        </View>
                    </TouchBox>
                ))}
            </Row>

            <Row>
                {categoriesList.slice(3, 5).map((item, index) => (
                    <TouchBox
                        padding={16}
                        height={62}
                        isFull
                        key={index}
                        onClick={() => handleClick(item.id)}
                    >
                        <View style={styles.Box}>
                            <item.icon />
                            <Txt>{item.name}</Txt>
                        </View>
                    </TouchBox>
                ))}
            </Row>
        </View>
    )
}
export default Categories

const styles = StyleSheet.create({
    Categories: {
        width: '100%',
        paddingHorizontal: 20,
        marginVertical: '4%',
        gap: 16
    },
    Box: {
        alignItems: "center",
        gap: 4,
        paddingVertical: 8
    }
})
