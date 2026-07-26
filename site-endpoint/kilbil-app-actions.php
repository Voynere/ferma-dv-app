<?php
/**
 * Kilbil: REST-эндпоинт для мобильного приложения.
 *
 * Отдаёт по списку SKU активные акции (скидку и тип), которые уже
 * посчитаны ночным cron (ferma_kilbil_nightly_sync) и хранятся в
 * postmeta: _kilbil_discount_percent + _kilbil_action_type.
 *
 * Приложение шлёт свои SKU (= артикулы MoySklad) и получает обратно
 * только те, что участвуют в акциях. UUID Эвотора и вызовы Kilbil
 * остаются на сервере — в клиент ничего секретного не уходит.
 *
 * GET /wp-json/ferma/v1/actions-by-skus?skus=21209,526025,...
 *   → { "21209": { "discount": 7, "action_type": "green_price" }, ... }
 *
 * Только товары с действующей скидкой попадают в ответ.
 *
 * @package Theme
 */

add_action( 'rest_api_init', 'ferma_kilbil_register_actions_endpoint' );

function ferma_kilbil_register_actions_endpoint(): void {
	register_rest_route(
		'ferma/v1',
		'/actions-by-skus',
		array(
			'methods'             => 'GET',
			'callback'            => 'ferma_kilbil_actions_by_skus',
			'permission_callback' => '__return_true',
			'args'                => array(
				'skus' => array(
					'required' => true,
					'type'     => 'string',
				),
			),
		)
	);
}

function ferma_kilbil_actions_by_skus( \WP_REST_Request $request ): \WP_REST_Response {
	$skus_raw = (string) $request->get_param( 'skus' );
	$skus     = array_filter( array_map( 'trim', explode( ',', $skus_raw ) ) );
	$skus     = array_values( array_unique( $skus ) );

	if ( empty( $skus ) ) {
		return new \WP_REST_Response( (object) array(), 200 );
	}

	// Ограничение на размер батча (как у stocks-by-skus).
	if ( count( $skus ) > 1000 ) {
		$skus = array_slice( $skus, 0, 1000 );
	}

	global $wpdb;

	// Плейсхолдеры для IN(...).
	$placeholders = implode( ',', array_fill( 0, count( $skus ), '%s' ) );

	// Одним запросом: sku → discount, action_type.
	// Берём товары, у которых есть _sku из запроса И задан _kilbil_discount_percent > 0.
	$sql = "
		SELECT pm_sku.meta_value   AS sku,
		       pm_disc.meta_value  AS discount,
		       COALESCE(pm_type.meta_value, 'daily') AS action_type
		FROM {$wpdb->postmeta} pm_sku
		INNER JOIN {$wpdb->postmeta} pm_disc
			ON pm_disc.post_id = pm_sku.post_id
			AND pm_disc.meta_key = '_kilbil_discount_percent'
			AND pm_disc.meta_value + 0 > 0
		LEFT JOIN {$wpdb->postmeta} pm_type
			ON pm_type.post_id = pm_sku.post_id
			AND pm_type.meta_key = '_kilbil_action_type'
		WHERE pm_sku.meta_key = '_sku'
		  AND pm_sku.meta_value IN ($placeholders)
	";

	// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
	$rows = $wpdb->get_results( $wpdb->prepare( $sql, $skus ) );

	$out = array();
	if ( is_array( $rows ) ) {
		foreach ( $rows as $row ) {
			$sku = (string) $row->sku;
			if ( '' === $sku ) {
				continue;
			}
			$out[ $sku ] = array(
				'discount'    => (int) $row->discount,
				'action_type' => (string) $row->action_type,
			);
		}
	}

	$response = new \WP_REST_Response( (object) $out, 200 );
	// Лёгкое кэширование на стороне CDN/браузера — данные меняются раз в сутки.
	$response->header( 'Cache-Control', 'public, max-age=300' );
	return $response;
}
