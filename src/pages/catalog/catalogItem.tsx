import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Header from '../../components/Header';
import List from '../../components/Sections/Catalog/List';
import useGlobalStore from '../../store';
import useCatalogStore from '../../store/catalog';
import Search from '../../ui/Search';
import Txt from '../../ui/Text';
import { useNavigation } from '@react-navigation/native';

export default function CatalogItem() {
    const scrollRef = useRef<ScrollView>(null);
    const { enableScroll, changeEnableScroll } = useGlobalStore();
    const { search, changeSearch, searchProductByName, searchList } = useCatalogStore();
    const [localSearch, setLocalSearch] = useState(search);
    const [headerHeight, setHeaderHeight] = useState(0);
    const navigation = useNavigation<any>();

    const searchWrapperRef = useRef<View>(null);

    const scrollToSearch = () => {
        if (!scrollRef?.current || !searchWrapperRef.current) return;
        searchWrapperRef.current.measure((fx, fy, width, height, px, py) => {
            scrollRef.current?.scrollTo({ y: py - 100, animated: true });
        });
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            changeSearch(localSearch);
            if (localSearch.length > 0) {
                searchProductByName(localSearch);
                changeEnableScroll(false);
                scrollToSearch();
            }
        }, 300);

        if (localSearch.length === 0) {
            changeEnableScroll(true);
        }

        return () => clearTimeout(handler);
    }, [localSearch, changeSearch, searchProductByName]);

    const isSearchActive = localSearch.length > 0;

    return (
        <View style={styles.Container}>
            {!isSearchActive && (
                <View 
                    style={styles.HeaderWrapperFixed}
                    onLayout={(event) => {
                        setHeaderHeight(event.nativeEvent.layout.height);
                    }}
                >
                    <Header scrollRef={scrollRef} isHideSearch={true} />
                    
                    <View style={styles.SearchContainer} ref={searchWrapperRef}>
                        <Search
                            value={localSearch}
                            onChange={setLocalSearch}
                            onFocus={scrollToSearch}
                        />
                    </View>
                </View>
            )}
            
            <ScrollView 
                ref={scrollRef} 
                scrollEnabled={enableScroll} 
                contentContainerStyle={[
                    styles.ContentContainer,
                    !isSearchActive && { paddingTop: headerHeight }
                ]}
            >
                {isSearchActive && (
                    <View onLayout={(event) => {
                        if (isSearchActive) {
                            setHeaderHeight(event.nativeEvent.layout.height);
                        }
                    }}>
                        <Header scrollRef={scrollRef} isHideSearch={true} />
                        
                        <View style={styles.SearchContainer} ref={searchWrapperRef}>
                            <Search
                                value={localSearch}
                                onChange={setLocalSearch}
                                onFocus={scrollToSearch}
                            />

                            {searchList.length > 0 && (
                                <View style={styles.SearchBox}>
                                    <ScrollView style={styles.SearchBoxScroll}>
                                        {searchList.map(item => (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={styles.SearchBoxItem}
                                                activeOpacity={0.5}
                                                onPress={() => {
                                                    changeEnableScroll(true);
                                                    setLocalSearch("");
                                                    navigation.navigate('product', { id: item.id });
                                                }}
                                            >
                                                <Txt weight="Bold" size={16} numberOfLines={1} lineHeight={22}>{item.name}</Txt>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                            {searchList.length === 0 && (
                                <View style={[styles.SearchBox, { paddingVertical: 12 }]}> 
                                    <Txt>Ничего не найдено</Txt>
                                </View>
                            )}
                        </View>
                    </View>
                )}
                <List />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    HeaderWrapperFixed: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        elevation: 10000,
        backgroundColor: '#fff',
    },
    ContentContainer: {
        paddingBottom: 100,
    },
    SearchContainer: { 
        position: "relative",
        zIndex: 10000,
        elevation: 10000,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    SearchBox: {
        position: "absolute",
        backgroundColor: "#fff",
        width: Dimensions.get("screen").width - 32,
        left: 16,
        zIndex: 10000,
        elevation: 10000,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#4FBD01",
        padding: 20,
        top: 55
    },
    SearchBoxScroll: { 
        maxHeight: 150 
    },
    SearchBoxItem: { 
        paddingBottom: 12 
    },
});

