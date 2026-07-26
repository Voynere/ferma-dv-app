import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import React, { FC, useState } from 'react';
import Icons from './Icons';
import Txt from './Text';
import useGlobalStore from '../store';

interface Props {
    placeholder?: string;
    value: number | null;
    array: string[];
    onChange: (value: number) => void;
    isScrollEnabled?: boolean
}

const Select: FC<Props> = ({ array, onChange, value, placeholder, isScrollEnabled }) => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const { changeEnableScroll, enableScroll } = useGlobalStore()

    const toggleDropdown = () => {
        if (isScrollEnabled) {
            changeEnableScroll(!enableScroll)
        }

        setDropdownVisible(!isDropdownVisible);
    };

    const handleSelect = (option: string) => {
        onChange(array.indexOf(option));
        setDropdownVisible(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.Select} onPress={toggleDropdown}
                activeOpacity={0.5}>
                <View style={{ flex: 1 }}>
                    <Txt lines={1}>{(value !== null && array[value]) || placeholder || ""}</Txt>
                </View>
                <Icons.ArrowRight style={styles.Icon} />
            </TouchableOpacity>

            {isDropdownVisible && (
                <View style={styles.dropdown}>
                    <ScrollView
                        nestedScrollEnabled={true}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        keyboardShouldPersistTaps="handled">
                        {array.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleSelect(option)}
                                style={styles.dropdownItem}
                                activeOpacity={0.5}
                            >
                                <Txt
                                    color={index === value
                                        ? "#4D4D4D"
                                        : "rgba(52, 52, 52, 0.5)"
                                    }
                                >{option}</Txt>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

export default Select;

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: '100%',
    },
    Select: {
        width: "100%",
        height: 56,
        backgroundColor: "#fff",
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        gap: 8,
        borderWidth: 1,
        borderColor: "#4D4D4D80"
    },
    Icon: {
        width: 24,
        height: 24,
        transform: [{ rotate: "90deg" }]
    },
    dropdown: {
        position: 'absolute',
        top: 55,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: '#4D4D4D80',
        maxHeight: 200,
        zIndex: 100,
    },
    dropdownItem: {
        padding: 10,
    },
});