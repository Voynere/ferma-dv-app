import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import Txt from '../../../ui/Text';
import useCatalogStore from '../../../store/catalog';
import ProductCard from '../../../ui/ProductCard';
import { categoriesList } from '../../../constants';
import { useRoute, RouteProp } from '@react-navigation/native';
import Pagination from '../../Pagination';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import ProductCardSkeleton from '../../../ui/ProductCardSkeleton';
import Banners from './Banners';

type RootStackParamList = {
  List: { id: string };
};

const List = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'List'>>();
  const { id } = route.params;
  const {
    productWithAtrList,
    getDataFromAtributes,
    isAtributesLoading,
    isPagination,
    pages,
    activePage
  } = useCatalogStore();

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 32 - 24) / 2;
  
  const GREEN_PRICES_ID = '762d57da-1191-11ee-0a80-043600051b3e';
  // Экраны Kilbil-акций (без пагинации; баннеры показываем только на «Зелёных ценниках»).
  const ACTION_SCREEN_IDS = [GREEN_PRICES_ID, 'kilbil-meat-sunday', 'kilbil-sausage-tuesday'];
  const isActionScreen = ACTION_SCREEN_IDS.includes(id);
  const isGreenPrices = id === GREEN_PRICES_ID;
  const showPagination = isPagination && !isActionScreen;

  useEffect(() => {
    if (!id) {
      return;
    }
    getDataFromAtributes(id);
  }, [id, activePage]);

  return (
    <View style={styles.Container}>
      <FlatList
        data={productWithAtrList || []}
        keyExtractor={(item, index) => String(item?.id ?? index)}
        numColumns={2}
        columnWrapperStyle={styles.Row}
        renderItem={({ item }) => <ProductCard item={item} />}
        ListHeaderComponent={isGreenPrices ? (
          <View style={styles.BannersBox}>
            <Banners />
          </View>
        ) : null}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: isActionScreen ? 200 : (showPagination ? 140 : 100),
          minHeight: Dimensions.get('window').height,
        }}
        initialNumToRender={6}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        ListEmptyComponent={
          isAtributesLoading ? (
            <View style={{ paddingTop: 20 }}>
              <LoadingSpinner message="Загружаем товары..." />
              <View style={styles.SkeletonGrid}>
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </View>
            </View>
          ) : (
            <Txt>Нет товаров</Txt>
          )
        }
      />

      {showPagination && (
        <View style={[styles.Container, { marginBottom: 120 }]}>
          <Pagination
            onChange={(value) => {
              getDataFromAtributes(id);
            }}
            pages={pages}
            activePage={activePage}
          />
        </View>
      )}
    </View>
  );
};

export default List;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  Row: {
    gap: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  Header: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  Loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '5%',
  },
  SkeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  BannersBox: {
    marginBottom: 24,
    marginTop: 8,
  },
});