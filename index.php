<?php
/*
Plugin Name: Mortgage Calculator By Timothy
Description: A simple mortgage calculator plugin.
Version: 1.39
Author: Timothy Lam
*/

function mortgage_calculator_enqueue_scripts()
{
    // Define the path to the plugin build directory
    $plugin_dir = plugin_dir_path(__FILE__) . 'dist/assets/';
    $plugin_url = plugins_url('dist/assets/', __FILE__);

    // Dynamically find the JS and CSS files (assuming only one JS and one CSS file)
    $js_files = glob($plugin_dir . '*.js');
    $css_files = glob($plugin_dir . '*.css');

    if (!empty($css_files)) {
        // Get the first CSS file
        $css_file = basename($css_files[0]);
        wp_enqueue_style('mortgage-calculator-styles', $plugin_url . $css_file);
    }

    if (!empty($js_files)) {
        // Get the first JS file
        $js_file = basename($js_files[0]);
        wp_enqueue_script('mortgage-calculator-script', $plugin_url . $js_file, array('jquery'), null, true);
    }
}
add_action('wp_enqueue_scripts', 'mortgage_calculator_enqueue_scripts');

function mortgage_calculator_shortcode($atts)
{
    // Set default values for attributes
    $atts = shortcode_atts(array(
        'price' => 200000,

    ), $atts, 'mortgage_calculator');

    $price = is_numeric($atts['price']) ? floatval($atts['price']) : 200000;

    // Localize script to pass data from PHP to JavaScript
    $initial_values = array(
        'price' => $price,
    );

    wp_localize_script('mortgage-calculator-script', 'mortgageCalculatorData', $initial_values);

    ob_start();
?>
    <div id="root"></div>
<?php
    return ob_get_clean();
}
add_shortcode('mortgage_calculator', 'mortgage_calculator_shortcode');
