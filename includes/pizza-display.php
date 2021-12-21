<?php
class Ev_Pizza_Display
{
    public function __construct()
    {
        add_filter('woocommerce_get_price_html', [$this, 'change_price'], 10, 2);
        add_filter('woocommerce_available_variation', [$this, 'modify_attr_array'], 10, 3);
        add_filter('woocommerce_cart_item_price', [$this, 'modify_price_mini_cart'], 10, 3);
    }
    /**
     * Set price for product in form.cart attributes
     */
    public function modify_attr_array($data, $product_variable, $variation)
    {
        if (!ev_is_pizza_product($product_variable->get_id())) {
            return $data;
        }
        $product_pizza = Ev_Pizza_Product::get_product($product_variable);
        $data['display_price'] = wc_get_price_to_display($variation, ['price' => $product_pizza->get_price($variation->get_price())]);
        $data['display_regular_price'] =  wc_get_price_to_display($variation, ['price' => $product_pizza->get_price($variation->get_regular_price())]);
        return $data;
    }
    /**
     * Recalculate price for simple & variable pizza product
     */
    public function change_price($price, $product)
    {
        $product_id = $product->get_parent_id() ? $product->get_parent_id() : $product->get_id();
        if (!ev_is_pizza_product($product_id)) {
            return $price;
        }
        $product_pizza = Ev_Pizza_Product::get_product($product);
        if ($product->is_type('simple')) {


            if ($product_pizza->is_on_sale()) {

                $price = wc_format_sale_price(wc_get_price_to_display($product_pizza->get_wc_product(), array('price' => $product_pizza->get_regular_price())), wc_get_price_to_display($product_pizza->get_wc_product(), ['price' =>  $product_pizza->get_price()])) . $product_pizza->get_price_suffix();
            } else {
                $price = wc_price(wc_get_price_to_display($product_pizza->get_wc_product(), ['price' => $product_pizza->get_price()])) . $product_pizza->get_price_suffix();
            }
        } elseif ($product->is_type('variable')) {
            $prices = $product->get_variation_prices();
            if (empty($prices['price'])) {
                $price = apply_filters('woocommerce_variable_empty_price_html', '', $product);
            } else {
                $min_price     = $product_pizza->get_price(current($prices['price']));
                $max_price     = $product_pizza->get_price(end($prices['price']));
                $min_reg_price = $product_pizza->get_price(current($prices['regular_price']));
                $max_reg_price = $product_pizza->get_price(end($prices['regular_price']));

                if ($min_price !== $max_price) {
                    $price = wc_format_price_range($min_price, $max_price);
                } elseif ($product_pizza->is_on_sale() && $min_reg_price === $max_reg_price) {
                    $price = wc_format_sale_price(wc_price($max_reg_price), wc_price($min_price));
                } else {
                    $price = wc_price($min_price);
                }

                $price = apply_filters('woocommerce_variable_price_html', $price . $product_pizza->get_price_suffix(), $product);
            }
        } elseif ($product->is_type('variation')) {

            $product_variable = $product->get_parent_id();
            $product_pizza_parent = Ev_Pizza_Product::get_product($product_variable);

            if ($product_pizza_parent->is_on_sale()) {

                $price = wc_format_sale_price(wc_get_price_to_display($product, ['price' => $product_pizza_parent->get_price($product->get_regular_price())]), wc_get_price_to_display($product, ['price' =>  $product_pizza_parent->get_price($product->get_price())])) . $product_pizza_parent->get_price_suffix();
            } else {
                $price = wc_price(wc_get_price_to_display($product, ['price' => $product_pizza_parent->get_price($product->get_price())])) . $product_pizza_parent->get_price_suffix();
            }
        }

        return $price;
    }
    /**
     * Recalculate price in mini cart
     */
    public function modify_price_mini_cart($price, $cart_item, $cart_item_key)
    {
        $product_id = $cart_item['product_id'];
        if (!ev_is_pizza_product($product_id)) {
            return $price;
        }

        $food_components_data = json_decode(wp_unslash(get_post_meta($product_id, 'product_ev_pizza_full', true)), true);
        $product_sid = $cart_item['variation_id'] ? $cart_item['variation_id'] : $product_id;
        $price = Ev_Pizza_Product::get_product($product_sid)->get_price();
        if (isset($cart_item['ev_pizza_config'])) {
            if (isset($cart_item['ev_pizza_config']['extra']['components'])) {

                $pizza_add = $food_components_data['extra']['components'];
                foreach ($cart_item['ev_pizza_config']['extra']['components'] as $component) {
                    foreach ($pizza_add as $add_component) {
                        if ($component['id'] === $add_component['id']) {
                            $price +=  floatval($add_component['price']) * intval($component['quantity']);
                        }
                    }
                }
            }
            if (isset($cart_item['ev_pizza_config']['consists_of']['consists'])) {
                if (Ev_Pizza_Product::get_product($product_id)->is_price_inc()) {


                    $selected_consists = $cart_item['ev_pizza_config']['consists_of']['consists'];
                    $pizza_consists = $food_components_data['consists_of']['consists'];

                    if (!empty($pizza_consists)) {
                        foreach ($pizza_consists as $component) {

                            $found = false;
                            foreach ($selected_consists as $selected_component) {
                                if ($component['id'] === $selected_component['id']) {
                                    $found = true;
                                }
                            }
                            if (!$found) {
                                $price -= floatval($component['price']);
                            }
                        }
                    }
                }
            }
            if (isset($cart_item['ev_pizza_config']['consists_of']['to_add'])) {

                $pizza_add = $food_components_data['consists_of']['to_add'];
                foreach ($cart_item['ev_pizza_config']['consists_of']['to_add'] as $component) {
                    foreach ($pizza_add as $add_component) {
                        if ($component['id'] === $add_component['id']) {
                            $price +=  floatval($add_component['price']) * intval($component['quantity']);
                        }
                    }
                }
            }
            if (isset($cart_item['ev_pizza_config']['layers']['components'])) {
                $pizza_layers = $food_components_data['layers']['components'];
                foreach ($cart_item['ev_pizza_config']['layers']['components'] as $component) {
                    foreach ($pizza_layers as $layer_component) {

                        if ($component['id'] === $layer_component['id']) {
                            if ($product_id === $layer_component['id']) continue;
                            $price +=  floatval($component['price']);
                        }
                    }
                }
            }
            if (isset($cart_item['ev_pizza_config']['bortik']['components'])) {
                $pizza_sides = $food_components_data['bortik']['components'];
                foreach ($cart_item['ev_pizza_config']['bortik']['components'] as $component) {
                    foreach ($pizza_sides as $side_component) {
                        if ($component['id'] === $side_component['id']) {
                            $price +=  floatval($side_component['price']);
                        }
                    }
                }
            }
        }
        return wc_price($price);
    }
}
