<?php

/**
 * Template Pizza fancybox on Cart/Checkout pages
 
 */
if (!defined('ABSPATH')) {
    exit;
}
// var_dump($item_data);
?>

<div class="pizza-composition-block">
    <div class="pizza-composition-toggle" data-product-id='<?php echo esc_attr($key); ?>'>
        <span><?php echo apply_filters('ev_pizza_composition_text', esc_html(__('Pizza composition', 'pizza-builder-for-woocommerce')), $product->get_id()); ?></span>
    </div>

</div>
<div id="ev-pizza-<?php echo esc_attr($key); ?>" class="ev-pizza-fancy-ingredients" style="display: none;">
    <ul>
        <?php if (isset($item_data['consists_of']['consists'])) : ?>
            <li>
                <strong><?php echo esc_html($item_data['consists_of']['consists_text']); ?></strong>
                <?php foreach ($item_data['consists_of']['consists'] as $component) : ?>
                    <p><span><?php echo wp_kses_post($component['key']); ?></span><span><?php echo wp_kses_post($component['value']); ?></span></p>
                <?php endforeach; ?>
            </li>
        <?php endif; ?>
        <?php if (isset($item_data['consists_of']['to_add'])) : ?>
            <li>
                <strong><?php echo esc_html($item_data['consists_of']['to_add_text']); ?></strong>
                <?php foreach ($item_data['consists_of']['to_add'] as $component) : ?>
                    <p><span><?php echo wp_kses_post($component['key']); ?></span><span><?php echo wp_kses_post($component['value']); ?></span></p>
                <?php endforeach; ?>
            </li>
        <?php endif; ?>

        <?php if (isset($item_data['layers']['components'])) : ?>
            <li>
                <strong><?php echo esc_html($item_data['layers']['layers_text']); ?></strong>
                <?php foreach ($item_data['layers']['components'] as $component) : ?>
                    <p><span><?php echo wp_kses_post($component['key']); ?></span><span><?php echo wp_kses_post($component['value']); ?></span></p>
                <?php endforeach; ?>
            </li>
        <?php endif; ?>
        <?php if (isset($item_data['bortik']['components'])) : ?>
            <li>
                <strong><?php echo esc_html($item_data['bortik']['bortik_text']); ?></strong>
                <?php foreach ($item_data['bortik']['components'] as $component) : ?>
                    <p><span><?php echo wp_kses_post($component['key']); ?></span><span><?php echo wp_kses_post($component['value']); ?></span></p>
                <?php endforeach; ?>
            </li>
        <?php endif; ?>
    </ul>
</div>