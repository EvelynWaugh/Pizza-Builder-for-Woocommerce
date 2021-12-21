<?php

/**
 * Custom quantity input for different input_names
 */
function ev_pizza_woo_quantity_input($args = array(), $product = null, $echo = true)
{
    if (is_null($product)) {
        $product = $GLOBALS['product'];
    }

    $defaults = array(
        'input_id'     => uniqid('quantity_'),
        'input_name'   => 'quantity',
        'input_value'  => '1',
        'classes'      => apply_filters('woocommerce_quantity_input_classes', array('input-text', 'qty', 'text'), $product),
        'max_value'    => apply_filters('woocommerce_quantity_input_max', -1, $product),
        'min_value'    => apply_filters('woocommerce_quantity_input_min', 0, $product),
        'step'         => apply_filters('woocommerce_quantity_input_step', 1, $product),
        'pattern'      => apply_filters('woocommerce_quantity_input_pattern', has_filter('woocommerce_stock_amount', 'intval') ? '[0-9]*' : ''),
        'inputmode'    => apply_filters('woocommerce_quantity_input_inputmode', has_filter('woocommerce_stock_amount', 'intval') ? 'numeric' : ''),
        'product_name' => $product ? $product->get_title() : '',
        'placeholder'  => apply_filters('woocommerce_quantity_input_placeholder', '', $product),
    );

    $args = apply_filters('woocommerce_quantity_input_args', wp_parse_args($args, $defaults), $product);

    // Apply sanity to min/max args - min cannot be lower than 0.
    $args['min_value'] = max($args['min_value'], 0);
    $args['max_value'] = 0 < $args['max_value'] ? $args['max_value'] : '';

    // Max cannot be lower than min if defined.
    if ('' !== $args['max_value'] && $args['max_value'] < $args['min_value']) {
        $args['max_value'] = $args['min_value'];
    }

    ob_start();

    wc_get_template('global/component-quantity-input.php', $args, '', EV_PIZZA_PATH . 'templates/');

    if ($echo) {

        echo ob_get_clean();
    } else {
        return ob_get_clean();
    }
}
/**
 * Check whether product is Pizza product
 */
function ev_is_pizza_product($product_id)
{
    return get_post_meta($product_id, '_ev_pizza', true) === 'yes' ? true : false;
}
/**
 * Check if Tipps enabled in Settings page
 */
function ev_pizza_tipps_enabled()
{
    $pizza_s_data = json_decode(wp_unslash(get_option('pizza_settings_data')), true);
    $pizza_settings = !empty($pizza_s_data) ? $pizza_s_data : false;
    if ($pizza_settings) {
        return $pizza_settings['tipps']['enabled'];
    }
    return false;
}
/**
 * Get image placeholders from Settings page
 */
function ev_pizza_get_image_placeholder(string $image)
{
    $pizza_s_data = json_decode(wp_unslash(get_option('pizza_settings_data')), true);
    $pizza_settings = !empty($pizza_s_data) ? $pizza_s_data : false;
    if ($pizza_settings) {
        if ($pizza_settings[$image]) {
            if (isset($pizza_settings[$image]['image_ID'])) {
                return wp_get_attachment_image_url($pizza_settings[$image]['image_ID'], 'medium');
            }
            return $pizza_settings[$image]['image'];
        }
    }
}
