<?php
class Ev_Pizza_Checkout
{
    public function __construct()
    {
        add_action('woocommerce_checkout_create_order_line_item',  [$this, 'checkout_create_order_item'], 10, 4);
        add_filter('woocommerce_order_item_display_meta_value',  [$this, 'display_meta_value'], 10, 2);
        add_filter('woocommerce_order_item_display_meta_key',  [$this, 'display_meta_key'], 10, 2);
        add_action('woocommerce_order_item_meta_end',   [$this, 'display_meta_thankyou_extra'], 10, 3);
        add_action('woocommerce_order_item_meta_end',   [$this, 'display_meta_thankyou_main'], 10, 3);
        add_action('woocommerce_after_order_itemmeta', [$this, 'display_meta_thankyou_extra'], 10, 3);
        add_action('woocommerce_after_order_itemmeta', [$this, 'display_meta_thankyou_main'], 10, 3);
        add_filter('woocommerce_checkout_cart_item_quantity', [$this, 'display_meta_checkout'], 10, 2);
    }
    /**
     * Save order meta data
     */
    public function checkout_create_order_item($order_item, $cart_item_key, $cart_item_data, $order)
    {
        if (isset($cart_item_data['ev_pizza_config'])) {

            $order_item->update_meta_data('_ev_pizza_config', wc_clean($cart_item_data['ev_pizza_config']));
        }
    }
    /**
     * Display order meta value
     */
    public function display_meta_value($value, $meta)
    {

        if ($meta->key === '_ev_pizza_config') {
            if (!isset($meta->value['extra']['components'])) {
                return;
            }
            $output = '';
            foreach ($meta->value['extra']['components'] as $component) {


                $output .= $component['weight'] !== '' ? '<p>' . $component['name'] . ' ' .  $component['weight'] . '/' .  wc_price($component['price']) . ' x' . $component['quantity'] . '</p>' :  '<p>' . $component['name'] . ' ' .  wc_price($component['price']) . ' x' . $component['quantity'] . '</p>';
            }
            return $output;
        }
        return $value;
    }
    /**
     * Display order meta key
     */
    public function display_meta_key($display_key, $meta)
    {

        if ($display_key === '_ev_pizza_config') {

            return apply_filters('ev_pizza_checkout_meta_key', esc_html__('Pizza components', 'pizza-builder-for-woocommerce'), $meta);
        }
        return $display_key;
    }
    /**
     * Display order meta fancybox in thankyou page & admin
     */
    public function display_meta_thankyou_main($item_id, $item, $order)
    {


        if (!ev_is_pizza_product($item->get_data()['product_id'])) {
            return;
        }

        $item_meta_data = $item->get_meta_data();
        $product_id = $item->get_data()['product_id'];
        $product = wc_get_product($product_id);
        $item_data = [];
        $html = '';
        foreach ($item_meta_data as $meta) {

            if ($meta->key !== '_ev_pizza_config') {
                continue;
            }
            if (isset($meta->value['extra']['components'])) {
                continue;
            }

            if (isset($meta->value['consists_of']['to_add'])) {

                $item_data['consists_of']['to_add_text'] = apply_filters('ev_pizza_components_adds_text', esc_html__('Components extra:', 'pizza-builder-for-woocommerce'), $product_id);
                foreach ($meta->value['consists_of']['to_add'] as $component) {
                    $item_data['consists_of']['to_add'][] = [
                        'key' => $component['name'],
                        'value' => $component['weight'] !== '' ? '<span>' . $component['weight'] . '/' . '</span>' . wc_price($component['price']) . '<span class="pizza-quantity-badge">' . ' x' . $component['quantity'] . '</span>' : wc_price($component['price']) . '<span class="pizza-quantity-badge">' . ' x' . $component['quantity'] . '</span>'
                    ];
                }
            }
            if (isset($meta->value['consists_of']['consists'])) {
                $item_data['consists_of']['consists_text'] = apply_filters('ev_pizza_components_basic_text', esc_html__('Basic Components:', 'pizza-builder-for-woocommerce'), $product_id);
                foreach ($meta->value['consists_of']['consists'] as $component) {
                    $item_data['consists_of']['consists'][] = [
                        'key' => $component['name'],
                        'value' => $component['weight'] !== '' ? '<span>' . $component['weight'] . '/' . '</span>' . wc_price($component['price']) : wc_price($component['price'])
                    ];
                }
            }
            if (isset($meta->value['layers']['components'])) {
                $item_data['layers']['layers_text'] = apply_filters('ev_pizza_components_layers_text', esc_html__('Layers:', 'pizza-builder-for-woocommerce'), $product_id);
                foreach ($meta->value['layers']['components'] as $component) {

                    $item_data['layers']['components'][] = [
                        'key' => $component['name'],
                        'value' => wc_price($component['price'])
                    ];
                }
            }
            if (isset($meta->value['bortik']['components'])) {
                $item_data['bortik']['bortik_text'] = apply_filters('ev_pizza_components_side_text', esc_html__('Side:', 'pizza-builder-for-woocommerce'), $product_id);
                foreach ($meta->value['bortik']['components'] as $component) {

                    $item_data['bortik']['components'][] = [
                        'key' => $component['name'],
                        'value' => wc_price($component['price'])
                    ];
                }
            }

            wc_get_template('cart/ev-pizza-meta.php', ['product' => $product, 'item_data' => $item_data, 'key' => $item_id], '', EV_PIZZA_PATH . 'templates/');
        }
    }
    /**
     * Display order meta in classic way fancybox in thankyou page & admin
     */
    public function display_meta_thankyou_extra($item_id, $item, $order)
    {

        if (!ev_is_pizza_product($item->get_data()['product_id'])) {
            return;
        }

        $item_data = $item->get_meta_data();


        $formatted_meta = [];
        foreach ($item_data as $meta) {

            if ($meta->key !== '_ev_pizza_config') {
                continue;
            }
            if (!isset($meta->value['extra']['components'])) {
                continue;
            }

            $formatted_meta[] = [
                'key'           => $meta->key,
                'value'         => $meta->value,
                'display_key'   => apply_filters('woocommerce_order_item_display_meta_key', $meta->key, $meta),
                'display_value' => wpautop(make_clickable(apply_filters('woocommerce_order_item_display_meta_value', $meta->value, $meta))),
            ];
        }

        $strings = array();
        $html    = '';
        $args    = wp_parse_args(
            [],
            array(
                'before'       => '<ul class="wc-item-meta"><li>',
                'after'        => '</li></ul>',
                'separator'    => '</li><li>',
                'echo'         => true,
                'autop'        => false,
                'label_before' => '<strong class="wc-item-meta-label">',
                'label_after'  => ':</strong> ',
            )
        );

        foreach ($formatted_meta as $meta_id => $meta) {
            $value     = $args['autop'] ? wp_kses_post($meta['display_value']) : wp_kses_post(make_clickable(trim($meta['display_value'])));
            if ($meta['key'] === '_ev_pizza_config') {

                $strings[] = '<strong class="wc-item-meta-label wc-item-food">' . wp_kses_post($meta['display_key']) . $args['label_after'] . $value;
            } else {
                $strings[] = $args['label_before'] . wp_kses_post($meta['display_key']) . $args['label_after'] . $value;
            }
        }

        if ($strings) {
            $html = $args['before'] . implode($args['separator'], $strings) . $args['after'];
        }

        $html = apply_filters('woocommerce_display_item_meta', $html, $item, $args);

        if ($args['echo']) {

            echo wp_kses_post($html);
        } else {
            return wp_kses_post($html);
        }
    }
    /**
     * Display cart meta data on checkout
     */
    public function display_meta_checkout($html, $cart_item)
    {
        $item_data = [];

        $product_id = $cart_item['data']->get_parent_id() ? $cart_item['data']->get_parent_id() : $cart_item['data']->get_id();
        $product = wc_get_product($product_id);
        if (ev_is_pizza_product($product_id)) {

            if (isset($cart_item['ev_pizza_config'])) {
                if (isset($cart_item['ev_pizza_config']['extra'])) {

                    return false;
                }
                if (isset($cart_item['ev_pizza_config']['consists_of']['to_add'])) {

                    $item_data['consists_of']['to_add_text'] = apply_filters('ev_pizza_components_adds_text', esc_html__('Components extra:', 'pizza-builder-for-woocommerce'), $cart_item['data']->get_id());
                    foreach ($cart_item['ev_pizza_config']['consists_of']['to_add'] as $component) {
                        $item_data['consists_of']['to_add'][] = [
                            'key' => $component['name'],
                            'value' => $component['weight'] !== '' ? '<span>' . $component['weight'] . '/' . '</span>' . wc_price($component['price']) . '<span class="pizza-quantity-badge">' . ' x' . $component['quantity'] . '</span>' : wc_price($component['price']) . '<span class="pizza-quantity-badge">' . ' x' . $component['quantity'] . '</span>'
                        ];
                    }
                }
                if (isset($cart_item['ev_pizza_config']['consists_of']['consists'])) {
                    $item_data['consists_of']['consists_text'] = apply_filters('ev_pizza_components_basic_text', esc_html__('Basic Components:', 'pizza-builder-for-woocommerce'), $cart_item['data']->get_id());
                    foreach ($cart_item['ev_pizza_config']['consists_of']['consists'] as $component) {
                        $item_data['consists_of']['consists'][] = [
                            'key' => $component['name'],
                            'value' => $component['weight'] !== '' ? '<span>' . $component['weight'] . '/' . '</span>' . wc_price($component['price']) : wc_price($component['price'])
                        ];
                    }
                }
                if (isset($cart_item['ev_pizza_config']['layers']['components'])) {
                    $item_data['layers']['layers_text'] = apply_filters('ev_pizza_components_layers_text', esc_html__('Layers:', 'pizza-builder-for-woocommerce'), $cart_item['data']->get_id());
                    foreach ($cart_item['ev_pizza_config']['layers']['components'] as $component) {

                        $item_data['layers']['components'][] = [
                            'key' => $component['name'],
                            'value' => wc_price($component['price'])
                        ];
                    }
                }
                if (isset($cart_item['ev_pizza_config']['bortik']['components'])) {
                    $item_data['bortik']['bortik_text'] = apply_filters('ev_pizza_components_side_text', esc_html__('Side:', 'pizza-builder-for-woocommerce'), $cart_item['data']->get_id());
                    foreach ($cart_item['ev_pizza_config']['bortik']['components'] as $component) {

                        $item_data['bortik']['components'][] = [
                            'key' => $component['name'],
                            'value' => wc_price($component['price'])
                        ];
                    }
                }

                wc_get_template('cart/ev-pizza-meta.php', ['product' =>  $product, 'item_data' => $item_data, 'key' => $cart_item['key']], '', EV_PIZZA_PATH . 'templates/');
            }
        }
    }
}
