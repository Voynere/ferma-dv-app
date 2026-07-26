import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import Icons from './Icons'

interface Props {
    value: string
    onChange: (value: string) => void
    onFocus?: () => void
    onSubmit?: () => void
}

const Search: FC<Props> = ({ onChange, value, onFocus, onSubmit }) => {
    return (
        <View style={styles.Search}>
            <Icons.Search color="#4FBD01" />
            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Поиск товаров"
                placeholderTextColor="rgba(79, 189, 1, 0.5)"
                style={styles.Input}
                onFocus={onFocus}
                onSubmitEditing={onSubmit}
                returnKeyType="search"
            />
            {value.length !== 0 && (
                <TouchableOpacity onPress={() => onChange("")} activeOpacity={0.5}>
                    <Icons.Close
                        color="rgba(0, 0, 0, 0.3)"
                        width={24}
                        height={24}
                    />
                </TouchableOpacity>
            )}
        </View>
    )
}

export default Search

const styles = StyleSheet.create({
    Search: {
        height: 48,
        paddingHorizontal: 24,
        paddingRight: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4FBD01',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14
    },
    Input: {
        height: "100%",
        width: "100%",
        flex: 1,
        fontSize: 16,
        fontFamily: "Regular",
        color: "#4D4D4D"
    }
})
