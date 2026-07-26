import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useMemo, memo, useCallback, useRef } from 'react'
import Txt from '../../../ui/Text'
import useCatalogStore from '../../../store/catalog'
import { useRoute, RouteProp } from '@react-navigation/native'
import { filteredCategories } from '../../../constants'

type RootStackParamList = {
    Categories: { id: string }
}

const Categories = memo(() => {
    const changeCategory = useCatalogStore(state => state.changeCategory)
    const catalogList = useCatalogStore(state => state.catalogList)
    const category = useCatalogStore(state => state.category)
    const isLoading = useCatalogStore(state => state.isLoading)
    const route = useRoute<RouteProp<RootStackParamList, 'Categories'>>()
    const { id } = route.params
    const lastClickTime = useRef(0)

    const activeCatalogItem = useMemo(() => 
        catalogList.find(i => i.id === id),
        [catalogList, id]
    )
    
    const filteredCategory = useMemo(() => 
        filteredCategories.find(f => f.name === activeCatalogItem?.name),
        [activeCatalogItem?.name]
    )
    
    const filteredSubCategories = useMemo(() => 
        activeCatalogItem?.subCategory?.filter(sub =>
            filteredCategory?.array.some(filtered => filtered === sub.name)
        ),
        [activeCatalogItem?.subCategory, filteredCategory?.array]
    )

    const handleCategoryClick = useCallback((categoryId: string) => {
        const now = Date.now()
        if (isLoading || now - lastClickTime.current < 800) {
            return
        }
        lastClickTime.current = now
        changeCategory(categoryId)
    }, [isLoading, changeCategory])

    return (
        <View style={styles.Categories}>
            <Txt size={24} weight="Jingleberry">
                {activeCatalogItem?.name}
            </Txt>

            <View
                style={styles.List}
                collapsable={false}
            >
                {filteredSubCategories?.map((item, index) => {
                    const isActive = category === item.id
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.Item,
                                isActive && styles.ItemActive
                            ]}
                            onPress={() => handleCategoryClick(item.id)}
                            disabled={isLoading}
                        >
                            <Txt weight="Bold" color={isActive ? "#4FBD01" : "#4D4D4D"}>
                                {item.name}
                            </Txt>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
})

Categories.displayName = 'Categories'

export default Categories

const styles = StyleSheet.create({
    Categories: {
        width: '100%',
        paddingHorizontal: 20,
        marginVertical: '4%',
        gap: 16
    },
    List: {
        flexWrap: 'wrap',
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
