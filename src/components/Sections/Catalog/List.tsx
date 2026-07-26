import { Dimensions, FlatList, StyleSheet, View, InteractionManager } from 'react-native';
import React, { useEffect, useCallback, useRef, useMemo } from 'react';
import Txt from '../../../ui/Text';
import useCatalogStore from '../../../store/catalog';
import ProductCard from '../../../ui/ProductCard';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import Pagination from '../../../components/Pagination';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import ProductCardSkeleton from '../../../ui/ProductCardSkeleton';
import { performanceMonitor } from '../../../utils/performanceMonitor';
import { requestManager } from '../../../utils/requestCancellation';

type RootStackParamList = {
  List: { id: string };
};

const List = () => {
  const {
    category,
    catalogList,
    productList,
    getProducts,
    isLoading,
    isPagination,
    pages,
    activePage,
    changePage,
  } = useCatalogStore();
  const route = useRoute<RouteProp<RootStackParamList, 'List'>>();
  const { id } = route.params;

  const activeCatalogItem = catalogList.find((i) => i.id === id);
  const activeCategory = activeCatalogItem?.subCategory?.find((i) => i.id === category);

  const screenWidth = Dimensions.get('window').width;
  const ITEM_HORIZONTAL_PADDING = 16 * 2;
  const GAP = 24;
  const NUM_COLUMNS = 2;
  const itemWidth = (screenWidth - ITEM_HORIZONTAL_PADDING - GAP) / NUM_COLUMNS;

  const isMounted = useRef(true)
  const abortController = useRef<AbortController | null>(null)
  const titleRef = useRef<View>(null)
  const lastLoadedKey = useRef('')

  const sortedProductList = useMemo(() => {
    if (!productList || productList.length === 0) return productList
    return [...productList].sort((a, b) => {
      const aOut = a.stock !== undefined && a.stock <= 0 ? 1 : 0
      const bOut = b.stock !== undefined && b.stock <= 0 ? 1 : 0
      return aOut - bOut
    })
  }, [productList])

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 380 + 24,
      offset: (380 + 24) * Math.floor(index / NUM_COLUMNS),
      index,
    }),
    []
  );

  const keyExtractor = useCallback((item: any) => item.id, [])
  const renderItem = useCallback(({ item, index }: any) =>
    <ProductCard item={item} width={itemWidth} key={item.id} />,
    [itemWidth]
  )

  useFocusEffect(
    useCallback(() => {
      performanceMonitor.startMonitoring()
      return () => {
        performanceMonitor.stopMonitoring()
      }
    }, [])
  )

  useEffect(() => {
    isMounted.current = true

    const currentKey = `${id}_${category}_${activePage}`

    if (lastLoadedKey.current === currentKey && productList.length > 0) {
      return () => {
        isMounted.current = false
      }
    }

    lastLoadedKey.current = currentKey

    const requestKey = `products_${currentKey}`
    const controller = requestManager.createCancellableRequest(requestKey)
    abortController.current = controller

    const loadProducts = () => {
      InteractionManager.runAfterInteractions(async () => {
        try {
          if (!isMounted.current || controller.signal.aborted) return

          performanceMonitor.logInteraction('Load Products', 'List')

          await Promise.race([
            getProducts(id),
            new Promise((_, reject) => {
              controller.signal.addEventListener('abort', () => reject(new Error('Aborted')))
            })
          ])
        } catch (error: any) {
        }
      })
    }

    loadProducts()

    return () => {
      isMounted.current = false
      requestManager.cancel(requestKey)
    }
  }, [id, category, activePage, getProducts])

  return (
    <View style={styles.Container}>
      {category !== '' && (
        <View ref={titleRef} collapsable={false}>
          <Txt size={24} weight="Jingleberry">
            {activeCategory?.name}
          </Txt>
        </View>
      )}

      {!isLoading ? (
        <>
          {sortedProductList.length > 0 ? (
            <>
              <FlatList
                data={sortedProductList}
                keyExtractor={keyExtractor}
                numColumns={2}
                columnWrapperStyle={styles.Row}
                renderItem={renderItem}
                contentContainerStyle={styles.FlatListContent}
                getItemLayout={getItemLayout}
                initialNumToRender={6}
                maxToRenderPerBatch={4}
                windowSize={5}
                removeClippedSubviews={false}
                scrollEnabled={false}
              />
              {isPagination && (
                <View style={styles.PaginationContainer}>
                  <Pagination
                    onChange={(value) => changePage(value)}
                    pages={pages}
                    activePage={activePage}
                  />
                </View>
              )}
            </>
          ) : (
            <View style={styles.EmptyContainer}>
              <Txt size={18} weight="Bold" color="#999">
                В этой категории пока нет товаров
              </Txt>
              <Txt size={14} color="#666" style={{ marginTop: 8, textAlign: 'center' }}>
                Попробуйте выбрать другую категорию или вернитесь позже
              </Txt>
            </View>
          )}
        </>
      ) : (
        <View style={{ paddingTop: 20 }}>
          <LoadingSpinner message="Загружаем товары..." />
          <View style={styles.SkeletonGrid}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        </View>
      )}
    </View>
  );
};

export default List;

const styles = StyleSheet.create({
  Container: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    zIndex: -1,
    elevation: -1,
  },
  Row: {
    gap: 24,
    marginBottom: 24,
  },
  FlatListContent: {
    flexGrow: 1,
    paddingBottom: 140,
  },
  PaginationContainer: {
    marginTop: 16,
    marginBottom: 120,
    alignItems: 'center',
  },
  EmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  SkeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginTop: 20,
  },
});