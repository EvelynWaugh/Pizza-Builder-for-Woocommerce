<?php

/**
 * Template for extra components buttons
 
 */
defined('ABSPATH') || exit;


?>

<div class="quantity">

    <button type="button" class="qty_button minus">-</button>

    <input type="number" id="<?php echo esc_attr($input_id); ?>" class="<?php echo esc_attr(join(' ', (array) $classes)); ?>" step="<?php echo esc_attr($step); ?>" min="<?php echo esc_attr($min_value); ?>" max="<?php echo esc_attr(0 < $max_value ? $max_value : ''); ?>" name="<?php echo esc_attr($input_name); ?>" value="<?php echo esc_attr($input_value); ?>" title="<?php echo esc_attr_x('Qty', 'Component quantity input tooltip', 'woocommerce'); ?>" size="4" placeholder="<?php echo esc_attr($placeholder); ?>" inputmode="<?php echo esc_attr($inputmode); ?>" />
    <button type="button" class="qty_button plus">+</button>

</div>
<?php
