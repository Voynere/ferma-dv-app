import {
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import React, { useCallback } from 'react';
import { catalogLIst, filteredCategories } from '../../../constants';
import Txt from '../../../ui/Text';
import useCatalogStore from '../../../store/catalog';
import { fillIconForCategory } from '../../../functions';
import { ICategory } from '../../../types';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../RootLayout';
import Header from '../../Header';
import LoadingSpinner from '../../../ui/LoadingSpinner';

interface Props {
  showHeader?: boolean;
  scrollRef?: React.RefObject<ScrollView>;
}

const Catalog = ({ showHeader = false, scrollRef }: Props) => {
  const { catalogList, isCategoriesLoading, changePage, changeCategory } = useCatalogStore();

  const filteredList = catalogList.filter(
    (i) => !filteredCategories.find((f) => f.name === i.name)?.isHidden
  );
  const sortedList = filteredList.sort((a, b) => {
    const positionA = filteredCategories.find((f) => f.name === a.name)?.position || Infinity;
    const positionB = filteredCategories.find((f) => f.name === b.name)?.position || Infinity;
    return positionA - positionB;
  });

  const greenPrices: ICategory = {
    icon: null,
    id: '762d57da-1191-11ee-0a80-043600051b3e',
    name: 'ЗЕЛЕНЫЕ ЦЕННИКИ',
    pathName: 'greenPrices',
  };

  const screenWidth = Dimensions.get('window').width;
  const ITEM_HORIZONTAL_PADDING = 16 * 2;
  const GAP = 24;
  const NUM_COLUMNS = 2;
  const itemWidth = (screenWidth - ITEM_HORIZONTAL_PADDING - GAP) / NUM_COLUMNS;

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handlePress = useCallback(
    (item: ICategory) => {
      navigation.navigate(
        item.pathName === 'greenPrices' ? 'atributes' : 'cartDetails',
        { id: item.id }
      );
      changePage(1);
      changeCategory('');
    },
    [changePage, changeCategory, navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: ICategory }) => (
      <TouchableOpacity
        style={[styles.Item, { backgroundColor: '#EEEEEE', width: itemWidth }]}
        activeOpacity={0.7}
        onPress={() => handlePress(item)}
      >
        {item.pathName === 'greenPrices' && (
          <View style={[styles.Background, { backgroundColor: '#4FBD01' }]} />
        )}
        <View style={styles.TextBox}>
          <Txt
            weight={item.pathName === 'greenPrices' ? 'Jingleberry' : 'Bold'}
            lineHeight={20}
            size={item.pathName === 'greenPrices' ? 20 : 16}
            color={item.pathName === 'greenPrices' ? '#fff' : '#4D4D4D'}
          >
            {item.name}
          </Txt>
        </View>
        <View style={styles.Icon}>{fillIconForCategory(item.id)}</View>
      </TouchableOpacity>
    ),
    [itemWidth, handlePress]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 172 + GAP, // Matches item height (172) + marginBottom (24)
      offset: (172 + GAP) * Math.floor(index / NUM_COLUMNS),
      index,
    }),
    []
  );

  return (
    <View style={styles.Container}>
      {showHeader && <Header scrollRef={scrollRef} />}
      <TouchableWithoutFeedback>
        <View style={styles.CatalogContainer}>
          {isCategoriesLoading ? (
            <LoadingSpinner message="Загружаем каталог..." />
          ) : (
            <FlatList
              data={[greenPrices, ...sortedList]}
              keyExtractor={(item) => item.id}
              numColumns={NUM_COLUMNS}
              columnWrapperStyle={styles.Row}
              renderItem={renderItem}
              initialNumToRender={6}
              windowSize={5}
              getItemLayout={getItemLayout}
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: '5%',
              }}
              scrollEnabled={true}
              bounces={true}
              removeClippedSubviews={false}
              ListEmptyComponent={<Txt>Нет категорий</Txt>}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

export default Catalog;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  CatalogContainer: {
    flex: 1,
  },
  Row: {
    gap: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  Item: {
    height: 172,
    borderRadius: 16,
    overflow: 'hidden',
  },
  Background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    borderRadius: 16,
    left: 0,
  },
  TextBox: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  Icon: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
});