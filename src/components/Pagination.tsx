import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { FC } from 'react';
import Txt from '../ui/Text';

interface Props {
    pages: number;
    activePage: number;
    onChange: (value: number) => void;
}

const Pagination: FC<Props> = ({ activePage, onChange, pages }) => {
    const getPaginationRange = () => {
        const totalPages = Math.ceil(pages);
        const range = [];

        let start = Math.max(1, activePage - 2);
        let end = Math.min(totalPages, activePage + 2);

        if (activePage <= 3) {
            end = Math.min(5, totalPages);
        }

        if (activePage >= totalPages - 2) {
            start = Math.max(totalPages - 4, 1);
        }

        for (let i = start; i <= end; i++) {
            range.push(i);
        }

        return range;
    };

    const paginationRange = getPaginationRange();

    return (
        <View style={styles.container}>
            {paginationRange.map((page) => (
                <TouchableOpacity
                    key={page}
                    activeOpacity={0.5}
                    onPress={() => onChange(page)}
                    style={[styles.page, activePage === page && styles.active]}
                >
                    <Txt size={16} color={activePage === page ? "#fff" : "#4D4D4D"}>{page}</Txt>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default Pagination;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    page: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    active: {
        backgroundColor: '#4FBD01',
    },
});
