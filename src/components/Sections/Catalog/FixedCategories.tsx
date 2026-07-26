import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Txt from '../../../ui/Text'
import useCatalogStore from '../../../store/catalog'
import { useRoute, RouteProp } from '@react-navigation/native'
import { filteredCategories } from '../../../constants'

// Определяем типы для роутов
type RootStackParamList = {
    FixedCategories: { id: string }
}

const FixedCategories = () => {
    const { changeCategory, catalogList, category } = useCatalogStore()
    const route = useRoute<RouteProp<RootStackParamList, 'FixedCategories'>>()
    const { id } = route.params

    const activeCatalogItem = catalogList.find(i => i.id === id)
    const filteredCategory = filteredCategories.find(f => f.name === activeCatalogItem?.name)
    const filteredSubCategories = activeCatalogItem?.subCategory?.filter(sub =>
        filteredCategory?.array.some(filtered => filtered === sub.name)
    )

    return (
        <View style={styles.Categories}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.List}>
                    {filteredSubCategories?.map((item, index) => {
                        const isActive = category === item.id
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.Item,
                                    isActive && styles.ItemActive
                                ]}
                                onPress={() => changeCategory(item.id)}
                            >
                                <Txt weight="Bold" color={isActive ? "#4FBD01" : "#4D4D4D"}>
                                    {item.name}
                                </Txt>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </ScrollView>
        </View>
    )
}

export default FixedCategories

const styles = StyleSheet.create({
    Categories: {
        width: '100%',
        paddingHorizontal: 10,
        marginVertical: 10,
        gap: 16
    },
    List: {
        flexDirection: 'row',
        gap: 10
    },
    Item: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: '#EEEEEE',
        height: 48,
        gap: 10,
        borderWidth: 1,
        borderColor: "rgba(77, 77, 77, 0.5)"
    },
    ItemActive: {
        borderColor: "#4FBD01",
        borderWidth: 2,
        backgroundColor: '#F0F9EC'
    }
})
