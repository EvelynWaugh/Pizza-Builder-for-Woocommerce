<?php

/**
 * Plugin Name: Pizza Builder for Woocommerce 
 * Author: wsjrcatarri
 * Description: Create components for pizza product
 * Version: 1.0
 * License: GPLv2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: pizza-builder-for-woocommerce
 */
defined('ABSPATH') || exit;

if (!defined('EV_PIZZA_PATH')) {
    define('EV_PIZZA_PATH', plugin_dir_path(__FILE__));
}
if (!defined('EV_PIZZA_DIR')) {
    define('EV_PIZZA_DIR', __FILE__);
}
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    exit;
}

class Ev_Pizza_Install
{
    protected static $instance = null;

    public static function instance()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct()
    {


        $this->include();
    }

    public function include()
    {

        require_once EV_PIZZA_PATH . 'includes/pizza-functions.php';
        require_once EV_PIZZA_PATH . 'includes/pizza.php';
        require_once EV_PIZZA_PATH . 'includes/pizza-product.php';
        require_once EV_PIZZA_PATH . 'includes/pizza-display.php';

        require_once EV_PIZZA_PATH . 'includes/pizza-cart.php';
        require_once EV_PIZZA_PATH . 'includes/pizza-checkout.php';
        Ev_Pizza::instance();
        new Ev_Pizza_Display();
        new Ev_Pizza_Cart();
        new Ev_Pizza_Checkout();
    }
}
function ev_pizza_initialize()
{
    $errors = [];
    //php verison check
    if (!function_exists('phpversion') || version_compare(phpversion(), '7.0.0', '<')) {
        $errors[] = 'php_error';
    }
    // Wocommerce version check
    if (!defined('WC_VERSION') || version_compare(WC_VERSION, '5.0.0', '<')) {
        $errors[] = 'wc_error';
    }
    if (count($errors) > 0) {
        add_action('admin_notices', function () use ($errors) {
            if (in_array('php_error', $errors)) {

?>
                <div class="notice notice-error">
                    <p>
                        <?php _e('Pizza Builder for Woocommerce requires at least 7.0.0 php version', 'pizza-builder-for-woocommerce'); ?>
                    </p>
                </div>
            <?php
            }
            if (in_array('wc_error', $errors)) {

            ?>
                <div class="notice notice-error">
                    <p>
                        <?php _e('Woocommerce must be active and have at least 5.0.0 version', 'pizza-builder-for-woocommerce'); ?>
                    </p>
                </div>
<?php

            }
        });
        return false;
    }


    Ev_Pizza_Install::instance();
}
add_action('plugins_loaded', 'ev_pizza_initialize', 5);
