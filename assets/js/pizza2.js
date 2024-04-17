(function ($) {

  const pizzaRules = {};
  pizzaRules.hooks = wp.hooks.createHooks();

  $(".component-buttons").on("click", ".plus, .minus", function () {
    var $qty = $(this).closest(".quantity").find(".component-qty"),
      currentVal = parseFloat($qty.val()),
      max = parseFloat($qty.attr("max")),
      min = parseFloat($qty.attr("min")),
      step = $qty.attr("step");

    // Format values
    if (!currentVal || currentVal === "" || currentVal === "NaN") currentVal = 0;
    if (max === "" || max === "NaN") max = "";
    if (min === "" || min === "NaN") min = 0;
    if (step === "any" || step === "" || step === undefined || parseFloat(step) === "NaN") step = 1;

    // Change the value
    if ($(this).is(".plus")) {
      if (max && currentVal >= max) {
        $qty.val(max);
      } else {
        $qty.val(currentVal + parseFloat(step));
      }
      if (currentVal + parseFloat(step) >= 1) {
        $qty.addClass("is-active");
        $(this).siblings(".minus").css("display", "block");
      }
    } else {
      if (min && currentVal <= min) {
        $qty.val(min);
      } else if (currentVal > 0) {
        $qty.val(currentVal - parseFloat(step));
      }
      if (currentVal - parseFloat(step) < 1) {
        $qty.removeClass("is-active");
        $(this).hide();
      }
    }
    $qty.trigger("change");
  });
  let symbolCurrency = FOOD_FRONT_DATA.wc_symbol,
    pricePosition = FOOD_FRONT_DATA.price_position,
    wcDecimals = FOOD_FRONT_DATA.decimals || 2,
    decimalSep = FOOD_FRONT_DATA.decimal_separator ? FOOD_FRONT_DATA.decimal_separator : ".",
    thousandSep = FOOD_FRONT_DATA.thousand_separator;

  function ev_wc_price(price) {
    function addThousandSep(n) {
      const rx = /(\d+)(\d{3})/;
      return String(n).replace(/^\d+/, function (w) {
        while (rx.test(w)) {
          w = w.replace(rx, "$1" + thousandSep + "$2");
        }
        return w;
      });
    }
    let priceString = price.toFixed(wcDecimals);
    priceString = priceString.replace(".", decimalSep);
    if (thousandSep) {
      priceString = addThousandSep(priceString);
    }
    switch (pricePosition) {
      case "left":
        priceString = `${symbolCurrency}${priceString}`;
        break;
      case "right":
        priceString = `${priceString}${symbolCurrency}`;
        break;
      case "left_space":
        priceString = `${symbolCurrency} ${priceString}`;
        break;
      case "right_space":
        priceString = `${priceString} ${symbolCurrency}`;
        break;
    }

    return priceString;
  }

  //todo
  const ev_wc_price_sale = (price, regular_price) => {
    switch (pricePosition) {
      case "left":
        return `<del>${symbol}${regular_price.toFixed(wcDecimals)}</del><ins>${symbol}${price.toFixed(wcDecimals)}</ins>`;
      case "right":
        return `<del>${regular_price.toFixed(wcDecimals)}${symbol}</del><ins>${price.toFixed(wcDecimals)}${symbol}</ins>`;
      case "left_space":
        return `<del>${symbol} ${regular_price.toFixed(wcDecimals)}</del><ins>${symbol} ${price.toFixed(wcDecimals)}</ins>`;
      case "right_space":
        return `<del>${regular_price.toFixed(wcDecimals)} ${symbol}</del><ins>${price.toFixed(wcDecimals)} ${symbol}</ins>`;
    }
  };
  const evParseNumber = (str, defaultValue = 0) => {
    const num = parseFloat(str);
    if (isNaN(num) || !isFinite(num)) {
      return defaultValue;
    }
    return num;
  };
  function calculateEvPizza() {
    const dataComponents = JSON.parse($(".pizza_components_wrapper").attr("data-pizza"));

    const layersEnabled = dataComponents.layers.enabled;
    const sidesEnabled = dataComponents.bortik.enabled;
    const pizzaSavedRules = dataComponents.rules;
    const pizzaSavedRulesCustom = dataComponents.rules.filter((rule) => rule.action === "custom");
    pizzaRules.hooks.addFilter("pizza-rules-custom", "ev_pizza", function (rules) {
      return [...rules, { id: "rule", value: "ruuule" }];
    });
    const inputLayer = $("[name=pizza-layer-data]");
    const inputSides = $("[name=pizza-sides-data]");
    let initialPrice = $(".pizza_components_wrapper").attr("data-price");
    let addToCartButton = $("form.cart").find(".single_add_to_cart_button");

    if ($("form.variations_form").length > 0) {
      console.log("variable");
      let $allowed = false;

      let selectedIdLayers = [
        {
          id: $(".pizza_components_wrapper").attr("data-product-id"),
          position: 1,
        },
      ];
      let selectedIdSides = [];
      const $variationForm = $("form.variations_form");
      let variationPrice = 0;
      let variationRegularPrice = 0;
      $variationForm.on("show_variation", function (event, variation) {
        selectedIdLayers[0].id = variation.variation_id;
        inputLayer.val(JSON.stringify(selectedIdLayers));
        if (variation.display_price !== variation.display_regular_price) {
          variationPrice = parseFloat(variation.display_price);
          variationRegularPrice = parseFloat(variation.display_regular_price);
          $(".pizza-variable-price").html(
            ev_wc_price_sale(parseFloat(variation.display_price), parseFloat(variation.display_regular_price))
          );
        } else {
          variationRegularPrice = 0;
          variationPrice = parseFloat(variation.display_price);
          $(".pizza-variable-price").html(ev_wc_price(variationPrice));
        }
        if (addToCartButton.is(".wc-variation-selection-needed")) {
          $allowed = false;
        } else {
          $allowed = true;
        }
        calculate();
      });
      $variationForm.on("hide_variation", function () {
        console.log("hide");
        variationPrice = 0;
        variationRegularPrice = 0;
        setTimeout(() => {
          if (addToCartButton.is(".wc-variation-selection-needed")) {
            $allowed = false;
          }
        }, 100);

        calculate();
      });
      $variationForm.on("woocommerce_variation_has_changed", function () {
        console.log("updated");
        if (addToCartButton.is(".wc-variation-selection-needed")) {
          $allowed = false;
        } else {
          $allowed = true;
        }
        calculate();
      });

      $(".component-buttons").on("click", ".plus, .minus", function () {
        if (!$allowed) {
          return;
        }
        calculate();
      });
      $("#remove-component .pizza-components-item").on("click", function () {
        if (!$allowed) {
          return;
        }
        calculateComponentsRemove($(this));
      });
      const calculate = () => {
        if (variationPrice === 0) {
          return;
        }
        if (!$allowed) {
          return;
        }
        let summ = variationPrice;

        if (dataComponents.ev_inc && $(".pizza-components-block").length) {
          let inputConsists = $("input[name=ev-pizza-consists]");
          let inputValue = JSON.parse(inputConsists.val());
          let priceConsistsExcl = 0;
          dataComponents.consists_of.consists.map((layer) => {
            inputValue.map((c) => {
              let key = Object.keys(c)[0];

              if (key === layer.id && !c[key]) {
                let layerPrice = parseFloat(layer.price);
                layerPrice = isNaN(layerPrice) || !isFinite(layerPrice) ? 0 : layerPrice;
                priceConsistsExcl += layerPrice;
              }
            });
          });
          summ = summ - priceConsistsExcl;
        }
        $("#add-component .pizza-components-item").each(function () {
          let val = $(this).find(".component-qty").val();
          let componentId = $(this).find(".component-buttons").attr("data-food-item");
          let componentObject = dataComponents.consists_of.to_add.find((component) => component.id === componentId);
          // console.log(componentObject);
          if (componentObject !== undefined) {
            let semiPrice = parseFloat(componentObject.price);
            semiPrice = isNaN(semiPrice) || !isFinite(semiPrice) ? 0 : semiPrice;
            summ += semiPrice * parseInt(val);
          }
        });
        if ($(".pizza-components-wrapper").length) {
          $(".components-item-wrapper .component-item").each(function () {
            let val = $(this).find(".component-qty").val();
            let componentId = $(this).find(".component-buttons").attr("data-food-item");
            let componentObject = dataComponents.extra.components.find((component) => component.id === componentId);
            // console.log(componentObject);
            if (componentObject !== undefined) {
              let semiPrice = parseFloat(componentObject.price);
              semiPrice = isNaN(semiPrice) || !isFinite(semiPrice) ? 0 : semiPrice;
              summ += semiPrice * parseInt(val);
            }
          });
        }
        if ($(".pizza-component-tabs-wrapper").length) {
          $(".pizza-component-tabs-wrapper .component-item").each(function () {
            let val = $(this).find(".component-qty").val();
            let componentId = $(this).find(".component-buttons").attr("data-food-item");
            let componentObject = dataComponents.extra.components.find((component) => component.id === componentId);
            // console.log(componentObject);
            if (componentObject !== undefined) {
              let semiPrice = parseFloat(componentObject.price);
              semiPrice = isNaN(semiPrice) || !isFinite(semiPrice) ? 0 : semiPrice;
              summ += semiPrice * parseInt(val);
            }
          });
        }
        if (layersEnabled) {
          let layersData = selectedIdLayers.filter((el, i) => i !== 0);

          layersData.forEach((el) => {
            let priceLayer = parseFloat($(`[data-layer=${el.id}]`).attr("data-layer-price"));
            priceLayer = isNaN(priceLayer) || !isFinite(priceLayer) ? 0 : priceLayer;
            summ += priceLayer;
          });
        }
        if (sidesEnabled) {
          if (selectedIdSides.length > 0) {
            const findSide = dataComponents.bortik.components.find((el) => el.id === selectedIdSides[0].id);
            // console.log(findSide);
            if (findSide) {
              let sidePrice = parseFloat(findSide.price);
              sidePrice = isNaN(sidePrice) || !isFinite(sidePrice) ? 0 : sidePrice;
              summ += sidePrice;
            }
          }
        }
        refreshPriceHtml(summ);
      };
      const refreshPriceHtml = (summ) => {
        let priceContainer = $("form.variations_form").find(".woocommerce-variation-price .price");
        let priceLayerContainer = $(document.body).find(".layers-total-price");
        if (variationRegularPrice > 0) {
          priceContainer.html(
            ev_wc_price_sale(
              summ,

              summ + (variationRegularPrice - variationPrice)
            )
          );
          if (layersEnabled || sidesEnabled) {
            priceLayerContainer.html(ev_wc_price(summ));
          }
        } else {
          priceContainer.html(ev_wc_price(summ));
          if (layersEnabled || sidesEnabled) {
            priceLayerContainer.html(ev_wc_price(summ));
          }
        }
      };
      const calculateComponentsRemove = (item) => {
        if (!item.find(".ev-remove-component").length) return;

        let componentId = item.attr("data-component-id");
        let inputConsists = $("input[name=ev-pizza-consists]");
        let inputValue = JSON.parse(inputConsists.val());
        let modiFiedData = inputValue.map((c) => {
          let key = Object.keys(c)[0];
          return c.hasOwnProperty(componentId) ? { [key]: !c[componentId] } : c;
        });
        inputConsists.val(JSON.stringify(modiFiedData));
        refreshClasses(modiFiedData);

        calculate();
      };

      const refreshClasses = (data) => {
        $("#remove-component .pizza-components-item").each(function () {
          $(this).removeClass("active");
        });

        data.forEach((c) => {
          let key = Object.keys(c)[0];
          !c[key] && $(`[data-component-id=${key}]`).closest(".pizza-components-item").addClass("active");
        });
      };

      const templateEvLayers = () => {
        inputLayer.val(JSON.stringify(selectedIdLayers));
        $(document.body).on("click", ".pizza-fancybox-layers .pizza-layer-item", function () {
          let product_id = $(this).attr("data-layer");
          let image = $(this).find("img").attr("src");
          let title = $(this).find(".ev-pizza-title").text();
          let price = $(this).find(".ev-pizza-price").html();
          let findElement = selectedIdLayers.findIndex((el) => el.id === product_id);
          if (findElement !== -1) {
            return;
          }
          if (selectedIdLayers.length >= 3) return;
          let positionIndexes = selectedIdLayers.map((l) => l.position);
          // console.log(positionIndexes);
          let templateIndexes = [1, 2, 3, 4, 5, 6, 7].filter((i) => !positionIndexes.includes(i));
          // console.log(templateIndexes);
          selectedIdLayers = [...selectedIdLayers, { id: product_id, position: Math.min(...templateIndexes) }];
          let indexElement = selectedIdLayers.findIndex((el) => el.id === product_id);
          // console.log(selectedIdLayers, indexElement);

          inputLayer.val(JSON.stringify(selectedIdLayers));

          const templateSelected = wp.template("pizza-layer-selected");
          const pizzaSelectedData = {
            name: title,
            image: image,
            product_id: product_id,
            price: price,
          };
          $(".pizza-fancybox-layers .pizza-layers-selected__item")
            .eq(Math.min(...templateIndexes) - 1)
            .replaceWith(templateSelected(pizzaSelectedData));
          calculate();
        });
        $(document.body).on("click", ".ev-remove-layer", function (e) {
          e.preventDefault();
          let product_id = $(this).closest(".pizza-layers-selected__item").attr("data-product-id");

          let index = $(".pizza-fancybox-layers .pizza-layers-selected__item").index($(`[data-product-id=${product_id}]`));
          const templateDefault = wp.template("pizza-layer-default");
          const pizzaDefaultData = {
            name: FOOD_FRONT_DATA.layer_default_text.replace("%s", index + 1),
            image: FOOD_FRONT_DATA.layer_default_image,
            product_id: "",
          };

          $(this).closest(".pizza-layers-selected__item").replaceWith(templateDefault(pizzaDefaultData));

          selectedIdLayers = selectedIdLayers.filter((el) => el.id !== product_id);
          inputLayer.val(JSON.stringify(selectedIdLayers));
          calculate();
        });
      };
      const templateEvSides = () => {
        inputSides.val(JSON.stringify(selectedIdSides));
        $(document.body).on("click", ".pizza-fancybox-sides .pizza-layer-item", function () {
          let side_id = $(this).attr("data-side-id");
          let image = $(this).find("img").attr("src");
          let title = $(this).find(".ev-pizza-title").text();
          let price = $(this).find(".ev-pizza-price").html();

          selectedIdSides = [{ id: side_id }];

          inputSides.val(JSON.stringify(selectedIdSides));

          const templateSelected = wp.template("pizza-side-selected");
          const pizzaSelectedData = {
            name: title,
            image: image,
            price: price,
          };
          $(".pizza-fancybox-sides .pizza-sides-selected__item").replaceWith(templateSelected(pizzaSelectedData));
          calculate();
        });
        $(document.body).on("click", ".ev-remove-side", function (e) {
          e.preventDefault();

          const templateDefault = wp.template("pizza-side-default");
          const pizzaDefaultData = {
            name: FOOD_FRONT_DATA.side_default_text,
            image: FOOD_FRONT_DATA.side_default_image,
            product_id: "",
          };

          $(this).closest(".pizza-layers-selected__item").replaceWith(templateDefault(pizzaDefaultData));

          selectedIdSides = [];
          inputSides.val(JSON.stringify(selectedIdSides));
          calculate();
        });
      };

      $("#pizza-layer-button").on("click", function (e) {
        e.preventDefault();
        if (!$allowed) {
          return;
        }
        $.fancybox.open({
          src: "#ev-pizza-layers-fancybox",
          type: "inline",
          touch: false,
          opts: {
            afterShow: function (instance) {
              // console.log(instance);
              let layerFancy = $(document.body).find("#ev-pizza-layers-fancybox");
              if (window.matchMedia("(min-width: 768px)").matches) {
                if (layerFancy.height() > window.innerHeight - 100) {
                  layerFancy.css("border-width", "0");
                  $(".pizza-layers-block", layerFancy).slimScroll({
                    height: window.innerHeight - 100,
                    railVisible: true,
                    alwaysVisible: true,
                    size: "6px",
                    color: "#FF0329",
                    railColor: "#EAEAEA",
                    railOpacity: 1,
                    wheelStep: 5,
                  });
                }
              } else {
                $(".pizza-layers-block", layerFancy).slick({
                  slidesToShow: 4,
                  infinite: false,
                  arrows: false,
                  responsive: [
                    {
                      breakpoint: 500,
                      settings: {
                        slidesToShow: 3,
                      },
                    },
                    {
                      breakpoint: 380,
                      settings: {
                        slidesToShow: 2,
                      },
                    },
                  ],
                });
              }
              $(document.body).trigger("ev-pizza-layers-show", instance);
            },
          },
        });
        templateEvLayers();

        $(".choose-layer-button").on("click", function (e) {
          e.preventDefault();
          $.fancybox.close();
        });
      });

      $("#pizza-sides-button").on("click", function (e) {
        e.preventDefault();
        if (!$allowed) {
          return;
        }
        $.fancybox.open({
          src: "#ev-pizza-bortik-fancybox",
          type: "inline",
          touch: false,
          opts: {
            afterShow: function (instance) {
              // console.log(instance);
              let sideFancy = $(document.body).find("#ev-pizza-bortik-fancybox");
              if (window.matchMedia("(min-width: 768px)").matches) {
                if (sideFancy.height() > window.innerHeight - 100) {
                  sideFancy.css("border-width", "0");
                  $(".pizza-layers-block", sideFancy).slimScroll({
                    height: window.innerHeight - 100,
                    railVisible: true,
                    alwaysVisible: true,
                    size: "6px",
                    color: "#FF0329",
                    railColor: "#EAEAEA",
                    railOpacity: 1,
                    wheelStep: 5,
                  });
                }
              } else {
                $(".pizza-layers-block", sideFancy).slick({
                  slidesToShow: 4,
                  infinite: false,
                  arrows: false,
                  responsive: [
                    {
                      breakpoint: 500,
                      settings: {
                        slidesToShow: 3,
                      },
                    },
                    {
                      breakpoint: 380,
                      settings: {
                        slidesToShow: 2,
                      },
                    },
                  ],
                });
              }
              $(document.body).trigger("ev-pizza-sides-show", instance);
            },
          },
        });
        templateEvSides();
        $(".choose-side-button").on("click", function (e) {
          e.preventDefault();
          $.fancybox.close();
        });
      });
    } else if ($("form.variations_form").length === 0 && $("form.cart").length > 0) {
      let selectedIdLayers = [
        {
          id: $(".pizza_components_wrapper").attr("data-product-id"),
          position: 1,
        },
      ];
      let selectedIdSides = [];
      $(".component-buttons").on("click", ".plus, .minus", function () {
        calculate();
      });
      $("#remove-component .pizza-components-item").on("click", function () {
        // e.preventDefault();
        calculateComponentsRemove($(this));
      });
      const templateEvLayers = () => {
        inputLayer.val(JSON.stringify(selectedIdLayers));
        $(document.body).on("click", ".pizza-fancybox-layers .pizza-layer-item", function () {
          let product_id = $(this).attr("data-layer");
          let image = $(this).find("img").attr("src");
          let title = $(this).find(".ev-pizza-title").text();
          let price = $(this).find(".ev-pizza-price").html();
          let findElement = selectedIdLayers.findIndex((el) => el.id === product_id);
          if (findElement !== -1) {
            return;
          }
          if (selectedIdLayers.length >= 3) return;
          let positionIndexes = selectedIdLayers.map((l) => l.position);

          let templateIndexes = [1, 2, 3, 4, 5, 6, 7].filter((i) => !positionIndexes.includes(i));

          selectedIdLayers = [...selectedIdLayers, { id: product_id, position: Math.min(...templateIndexes) }];
          let indexElement = selectedIdLayers.findIndex((el) => el.id === product_id);

          inputLayer.val(JSON.stringify(selectedIdLayers));

          const templateSelected = wp.template("pizza-layer-selected");
          const pizzaSelectedData = {
            name: title,
            image: image,
            product_id: product_id,
            price: price,
          };
          $(".pizza-fancybox-layers .pizza-layers-selected__item")
            .eq(Math.min(...templateIndexes) - 1)
            .replaceWith(templateSelected(pizzaSelectedData));
          calculate();
        });
        $(document.body).on("click", ".ev-remove-layer", function (e) {
          e.preventDefault();
          let product_id = $(this).closest(".pizza-layers-selected__item").attr("data-product-id");

          let index = $(".pizza-fancybox-layers .pizza-layers-selected__item").index($(`[data-product-id=${product_id}]`));

          const templateDefault = wp.template("pizza-layer-default");
          const pizzaDefaultData = {
            name: FOOD_FRONT_DATA.layer_default_text.replace("%s", index + 1),
            image: FOOD_FRONT_DATA.layer_default_image,
            product_id: "",
          };

          $(this).closest(".pizza-layers-selected__item").replaceWith(templateDefault(pizzaDefaultData));

          selectedIdLayers = selectedIdLayers.filter((el) => el.id !== product_id);
          inputLayer.val(JSON.stringify(selectedIdLayers));
          calculate();
        });
      };
      const templateEvSides = () => {
        inputSides.val(JSON.stringify(selectedIdSides));
        $(document.body).on("click", ".pizza-fancybox-sides .pizza-layer-item", function () {
          let side_id = $(this).attr("data-side-id");
          let image = $(this).find("img").attr("src");
          let title = $(this).find(".ev-pizza-title").text();
          let price = $(this).find(".ev-pizza-price").html();

          selectedIdSides = [{ id: side_id }];

          inputSides.val(JSON.stringify(selectedIdSides));

          const templateSelected = wp.template("pizza-side-selected");
          const pizzaSelectedData = {
            name: title,
            image: image,
            price: price,
          };
          $(".pizza-fancybox-sides .pizza-sides-selected__item").replaceWith(templateSelected(pizzaSelectedData));
          calculate();
        });
        $(document.body).on("click", ".ev-remove-side", function (e) {
          e.preventDefault();

          const templateDefault = wp.template("pizza-side-default");
          const pizzaDefaultData = {
            name: FOOD_FRONT_DATA.side_default_text,
            image: FOOD_FRONT_DATA.side_default_image,
            product_id: "",
          };

          $(this).closest(".pizza-layers-selected__item").replaceWith(templateDefault(pizzaDefaultData));

          selectedIdSides = [];
          inputSides.val(JSON.stringify(selectedIdSides));
          calculate();
        });
      };
      const calculate = () => {
        let summ = parseFloat(initialPrice);

        if (dataComponents.ev_inc && $(".pizza-components-block").length) {
          let inputConsists = $("input[name=ev-pizza-consists]");
          let inputValue = JSON.parse(inputConsists.val());
          let priceConsistsExcl = 0;
          dataComponents.consists_of.consists.map((layer) => {
            inputValue.map((c) => {
              let key = Object.keys(c)[0];

              if (key === layer.id && !c[key]) {
                let layerPrice = parseFloat(layer.price);
                layerPrice = isNaN(layerPrice) || !isFinite(layerPrice) ? 0 : layerPrice;
                priceConsistsExcl += layerPrice;
              }
            });
          });
          summ = summ - priceConsistsExcl;
        }

        $("#add-component .pizza-components-item").each(function () {
          let val = $(this).find(".component-qty").val();
          let componentId = $(this).find(".component-buttons").attr("data-food-item");
          let componentObject = dataComponents.consists_of.to_add.find((component) => component.id === componentId);
          // console.log(componentObject);
          if (componentObject !== undefined) {
            let semiPrice = parseFloat(componentObject.price);
            semiPrice = isNaN(semiPrice) || !isFinite(semiPrice) ? 0 : semiPrice;
            // summ += semiPrice * parseInt(val);
			const modPrice = runRules(componentObject, { qty: val }, 'pizza');
              summ += modPrice;
          }
        });

        if ($(".pizza-components-wrapper").length) {
          $(".components-item-wrapper .component-item").each(function () {
            let val = $(this).find(".component-qty").val();
            let componentId = $(this).find(".component-buttons").attr("data-food-item");
            let componentObject = dataComponents.extra.components.find((component) => component.id === componentId);
            // console.log(componentObject);
            if (componentObject !== undefined) {
              let semiPrice = parseFloat(componentObject.price);
              semiPrice = isNaN(semiPrice) || !isFinite(semiPrice) ? 0 : semiPrice;
              const modPrice = runRules(componentObject, { qty: val }, 'extra');
              summ += modPrice;
            }
          });
        }

        if ($(".pizza-component-tabs-wrapper").length) {
          $(".pizza-component-tabs-wrapper .component-item").each(function () {
            let val = $(this).find(".component-qty").val();

            let componentId = $(this).find(".component-buttons").attr("data-food-item");
            let componentObject = dataComponents.extra.components.find((component) => component.id === componentId);

            // console.log(componentObject);
            if (componentObject !== undefined) {
              let semiPrice = parseFloat(componentObject.price);
              semiPrice = isNaN(semiPrice) || !isFinite(semiPrice) ? 0 : semiPrice;
              const modPrice = runRules(componentObject, { qty: val }, 'tabs');
              summ += modPrice;
            }
          });
        }

        if (layersEnabled) {
          let layersData = selectedIdLayers.filter((el, i) => i !== 0);

          layersData.forEach((el) => {
            let priceLayer = parseFloat($(`[data-layer=${el.id}]`).attr("data-layer-price"));
            priceLayer = isNaN(priceLayer) || !isFinite(priceLayer) ? 0 : priceLayer;
            summ += priceLayer;
          });
        }
        if (sidesEnabled) {
          if (selectedIdSides.length > 0) {
            const findSide = dataComponents.bortik.components.find((el) => el.id === selectedIdSides[0].id);

            if (findSide) {
              let sidePrice = parseFloat(findSide.price);
              sidePrice = isNaN(sidePrice) || !isFinite(sidePrice) ? 0 : sidePrice;
              summ += sidePrice;
            }
          }
        }
        refreshPriceHtml(summ);
      };
      const refreshPriceHtml = (summ) => {
        let priceContainer = $(".product.first").find(".price").first();
        let priceLayerContainer = $(document.body).find(".layers-total-price");

        priceContainer.html(ev_wc_price(summ));
        if (layersEnabled || sidesEnabled) {
          priceLayerContainer.html(ev_wc_price(summ));
        }
      };
      const runRules = (componentObject, args, type='extra') => {
        
        const qty = args.qty ? args.qty : 0;
        const price = componentObject.price;
        const totalComponentPrice = evParseNumber(price) * qty; //float
        let returnPrice = totalComponentPrice;
        const pizzaCustomRules = pizzaRules.hooks.applyFilters("pizza-rules-custom", []);
        
        pizzaCustomRules.forEach((hook) => {
          if (hook.id === componentObject.id && typeof hook.callback === "function") {
            hook.callback(componentObject, args);
          }
        });
		let pizzaWrapper;
		if(type === 'extra') {
			pizzaWrapper = $('.pizza-components-wrapper');
		}
		else if (type === 'tabs') {
			pizzaWrapper = $('.pizza-component-tabs-wrapper');
		}
		else if(type === 'pizza') {
			pizzaWrapper = $('#add-component');
		}
		
        dataComponents.rules.forEach((rule) => {
          if (rule.name === componentObject.id) {
            switch (rule.name_action) {
              case "quantity":
                returnPrice = runNumericRule(componentObject, rule, qty, 'qty');
				break;
				case 'total_price':
				returnPrice = runNumericRule(componentObject, rule, qty, 'total');
				break;	
				case 'weight':
				returnPrice = runNumericRule(componentObject, rule, qty, 'weight');
				break;	
            }
          }
		  else if(rule.name === 'selected_extra') {
			let componentItem = pizzaWrapper.find('.component-item');
		  }
        });
        return returnPrice;
      };
      const runNumericRule = (componentObject, rule, qty, actionValue) => {
        const price = componentObject.price;
        let totalComponentPrice = evParseNumber(price) * qty;
        const pizzaCustomRules = pizzaRules.hooks.applyFilters("pizza-rules-custom", []);
        // console.log("meet2", rule, qty, componentObject);
		let valueToMatch;
		if(actionValue === 'qty') {
			valueToMatch = qty;
		}
		else if(actionValue === 'total') {
			valueToMatch = totalComponentPrice;
		}
		else if(actionValue === 'weight') {
			valueToMatch = qty * evParseNumber(componentObject.weight);
		}
        if (runMeetComparator(rule, valueToMatch)) {
        //   console.log("meet", rule, valueToMatch);
          switch (rule.action) {
            case "custom":
              const foundCallback = pizzaCustomRules.find((hook) => hook.id === rule.value);
              if (foundCallback) {
                return foundCallback.callback(componentObject, rule, valueToMatch);
              }
              return totalComponentPrice;
            case "discount":
              if (rule.value.toString().includes("%")) {
                totalComponentPrice -= (totalComponentPrice / 100) * evParseNumber(rule.value);
              } else {
                totalComponentPrice -= evParseNumber(rule.value);
              }
              return totalComponentPrice;

            case "fee":
              if (rule.value.toString().includes("%")) {
                totalComponentPrice += (totalComponentPrice / 100) * evParseNumber(rule.value);
              } else {
                totalComponentPrice += evParseNumber(rule.value);
              }
              return totalComponentPrice;
            case "hide":
              runHideAction(componentObject, rule.value, true);
              return totalComponentPrice;
          }
        }
		else {
			//revert hide if needed
			runHideAction(componentObject, rule.value, false);
			$(".pizza_components_wrapper").trigger('pizza-rules-not-matched', [componentObject, rule, qty, valueToMatch])
		}
        return totalComponentPrice;
      };
      const runMeetComparator = (rule, value) => {
        switch (rule.comparator) {
          case ">":
            return evParseNumber(value) > evParseNumber(rule.name_value);
          case "<":
            return evParseNumber(value) < evParseNumber(rule.name_value);
          case "=":
            return evParseNumber(value) === evParseNumber(rule.name_value);
          case "!=":
            return evParseNumber(value) !== evParseNumber(rule.name_value);
          case ">=":
            return evParseNumber(value) >= evParseNumber(rule.name_value);
          case "<=":
            return evParseNumber(value) <= evParseNumber(rule.name_value);
          default:
            return false;
        }
      };
      const calculateComponentsRemove = (item) => {
        if (!item.find(".ev-remove-component").length) return;
        let componentId = item.attr("data-component-id");
        let inputConsists = $("input[name=ev-pizza-consists]");
        let inputValue = JSON.parse(inputConsists.val());
        let modiFiedData = inputValue.map((c) => {
          let key = Object.keys(c)[0];
          return c.hasOwnProperty(componentId) ? { [key]: !c[componentId] } : c;
        });
        inputConsists.val(JSON.stringify(modiFiedData));
        refreshClasses(modiFiedData);

        calculate();
      };
      const runHideAction = (componentObject, value, matched) => {
       
		
		if(Array.isArray(value)) {
			value.forEach(element => {
				const qtyItem = $(".pizza_components_wrapper").find(`[data-food-item="${element.id}"]`);
				if(qtyItem.length) {
					const componentToHide = qtyItem.closest('.component-item');
					if(matched) {
						componentToHide.hide();
					}
					else {
						componentToHide.show();
					}
				}
				
			});
		}
      };
      const refreshClasses = (data) => {
        $("#remove-component .pizza-components-item").each(function () {
          $(this).removeClass("active");
        });

        data.forEach((c) => {
          let key = Object.keys(c)[0];
          !c[key] && $(`[data-component-id=${key}]`).closest(".pizza-components-item").addClass("active");
        });
      };
      $("#pizza-layer-button").on("click", function (e) {
        e.preventDefault();

        $.fancybox.open({
          src: "#ev-pizza-layers-fancybox",
          type: "inline",
          touch: false,
          opts: {
            afterShow: function (instance) {
              // console.log(instance);
              let layerFancy = $(document.body).find("#ev-pizza-layers-fancybox");
              if (window.matchMedia("(min-width: 768px)").matches) {
                if (layerFancy.height() > window.innerHeight - 100) {
                  layerFancy.css("border-width", "0");
                  $(".pizza-layers-block", layerFancy).slimScroll({
                    height: window.innerHeight - 100,
                    railVisible: true,
                    alwaysVisible: true,
                    size: "6px",
                    color: "#FF0329",
                    railColor: "#EAEAEA",
                    railOpacity: 1,
                    wheelStep: 5,
                  });
                }
              } else {
                $(".pizza-layers-block", layerFancy).slick({
                  slidesToShow: 4,
                  infinite: false,
                  arrows: false,
                  responsive: [
                    {
                      breakpoint: 500,
                      settings: {
                        slidesToShow: 3,
                      },
                    },
                    {
                      breakpoint: 380,
                      settings: {
                        slidesToShow: 2,
                      },
                    },
                  ],
                });
              }
              $(document.body).trigger("ev-pizza-layers-show", instance);
            },
          },
        });
        templateEvLayers();
        $(".choose-layer-button").on("click", function (e) {
          e.preventDefault();
          $.fancybox.close();
        });
      });

      $("#pizza-sides-button").on("click", function (e) {
        e.preventDefault();
        $.fancybox.open({
          src: "#ev-pizza-bortik-fancybox",
          type: "inline",
          touch: false,
          opts: {
            afterShow: function (instance) {
              // console.log(instance);
              let sideFancy = $(document.body).find("#ev-pizza-bortik-fancybox");
              if (window.matchMedia("(min-width: 768px)").matches) {
                if (sideFancy.height() > window.innerHeight - 100) {
                  sideFancy.css("border-width", "0");
                  $(".pizza-layers-block", sideFancy).slimScroll({
                    height: window.innerHeight - 100,
                    railVisible: true,
                    alwaysVisible: true,
                    size: "6px",
                    color: "#FF0329",
                    railColor: "#EAEAEA",
                    railOpacity: 1,
                    wheelStep: 5,
                  });
                }
              } else {
                $(".pizza-layers-block", sideFancy).slick({
                  slidesToShow: 4,
                  infinite: false,
                  arrows: false,
                  responsive: [
                    {
                      breakpoint: 500,
                      settings: {
                        slidesToShow: 3,
                      },
                    },
                    {
                      breakpoint: 380,
                      settings: {
                        slidesToShow: 2,
                      },
                    },
                  ],
                });
              }
              $(document.body).trigger("ev-pizza-sides-show", instance);
            },
          },
        });
        templateEvSides();
        $(".choose-side-button").on("click", function (e) {
          e.preventDefault();
          $.fancybox.close();
        });
      });
    }
  }

  if ($(".pizza_components_wrapper").length > 0) {
    $("body").addClass("ev-pizza-component");
    calculateEvPizza();
  }
  //ripple
  $(".component-buttons").on("mousedown", ".plus, .minus", function (e) {
    var $self = $(this);
    if ($self.is(".btn-disabled")) {
      return;
    }

    if ($self.closest(".plus, .minus")) {
      e.stopPropagation();
    }
    var initPos = $self.css("position"),
      offs = $self.offset(),
      x = e.pageX - offs.left,
      y = e.pageY - offs.top,
      dia = Math.min(this.offsetHeight, this.offsetWidth, 100),
      $ripple = $("<div/>", {
        class: "ripple",
        appendTo: $self,
      });
    if (!initPos || initPos === "static") {
      $self.css({ position: "relative" });
    }
    $("<div/>", {
      class: "rippleWave",
      css: {
        background: $self.data("ripple"),
        width: dia,
        height: dia,
        left: x - dia / 2,
        top: y - dia / 2,
      },
      appendTo: $ripple,
      one: {
        animationend: function () {
          $ripple.remove();
        },
      },
    });
  });

  $(".pizza-components-nav").on("click", "a", function (e) {
    e.preventDefault();
    $(".pizza-components-tab").each(function () {
      $(this).removeClass("fade-in");

      $(this)
        .parents(".slimScrollDiv")

        .height(0);
    });
    $(".pizza-components-nav a").each(function () {
      $(this).removeClass("active");
    });
    $(this).addClass("active");

    $(`${e.target.hash}`).addClass("fade-in");
    if ($(`${e.target.hash}`).height() > 450) {
      if (!$(`${e.target.hash}`).parents(".slimScrollDiv").length) {
        if (window.matchMedia("(min-width: 990px)").matches) {
          $(`${e.target.hash}`).css("padding-right", "25px");
          $(`${e.target.hash}`).slimScroll({
            height: 450,
            railVisible: true,
            alwaysVisible: true,
            size: "6px",
            color: "#FF0329",
            railColor: "#EAEAEA",
            railOpacity: 1,
            wheelStep: 5,
          });
        }
      }
    }
    $(`${e.target.hash}`)
      .parents(".slimScrollDiv")

      .height(450);
  });

  $(document.body).on("click", ".pizza-composition-toggle", function () {
    $.fancybox.open({
      src: `#ev-pizza-${$(this).attr("data-product-id")}`,
      type: "inline",
      touch: false,
    });
  });
  $(document.body).on("click", ".ev-remove-component", function (e) {
    e.preventDefault();
  });

  if ($(".pizza-component-tabs-wrapper").length) {
    $(".pizza-tab-link").on("click", function (e) {
      e.preventDefault();
      let tabId = $(this).attr("data-tab-id");
      $(".component-item-tab").each(function () {
        $(this).removeClass("fade-in");
      });
      $(".pizza-tab-link").each(function () {
        $(this).removeClass("active");
      });
      $(this).addClass("active");
      $(`#${tabId}`).addClass("fade-in");
    });
  }
  $(".pizza-components-tab").each(function () {
    if (window.matchMedia("(min-width: 990px)").matches) {
      if ($(this).height() > 450) {
        $(this).css("padding-right", "25px");
        $(this).slimScroll({
          height: 450,
          railVisible: true,
          alwaysVisible: true,
          size: "6px",
          color: "#FF0329",
          railColor: "#EAEAEA",
          railOpacity: 1,
          wheelStep: 5,
        });
      }
    } else {
      $(this).slick({
        // centerMode: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
        infinite: false,
        responsive: [
          {
            breakpoint: 767,
            settings: {
              slidesToShow: 4,
            },
          },
          {
            breakpoint: 500,
            settings: {
              slidesToShow: 3,
            },
          },
          {
            breakpoint: 380,
            settings: {
              slidesToShow: 2,
            },
          },
        ],
      });
    }
  });
  //tippy
  if (FOOD_FRONT_DATA.tippy_enabled && $("form.cart").length) {
    tippy("[data-tippy-content]");
  }
  //steps
  class EV_Pizza_Builder {
    constructor(stepId) {
      this.id = stepId;
      this.button = $(`.pbw-builder-button[data-steps=${this.id}]`);

      this.stepsModal = $(`.pbw-builder-wrapper[data-steps=${this.id}]`);
      this.form = $(".pbw-builder-form", this.stepsModal);
      this.steps = $(".pbw-builder-step-block", this.stepsModal);
      this.inputComponents = $("input[name=pbw_components]", this.stepsModal);
      this.choosenContainer = $(".pbw-builder-step__choosen", this.stepsModal);
      this.priceContainer = $(".pbw-total", this.choosenContainer);
      this.buyButton = $(".pbw-place-order", this.stepsModal);
      this.successContainer = $(".pbw-success-container", this.stepsModal);
      this.selectedComponents = [];
      this.data = window[`pbw_builder_${this.id}`];
      this.price = 0;
      this.prevButton = $(".pbw-prev", this.stepsModal);
      this.nextButton = $(".pbw-next", this.stepsModal);
      this.step = 1;
      this.shownSteps = [];
      this.required = this.data.data.components.map((c) => ({
        step: c.step,
        required: c.required == 1 ? true : false,
      }));
      //events
      this.button.on("click", this.openModal.bind(this));
      this.buyButton.on("click", this.submit.bind(this));
      this.stepsModal.on("click", ".pbw-builder-steps .pbw-builder-step__component", this.chooseComponent.bind(this));
      this.prevButton.on("click", (e) => {
        e.preventDefault();
        this.step--;
        if (this.step < 1) {
          this.step = 1;
        }
        this.move();
        this.validate();
      });

      this.nextButton.on("click", (e) => {
        e.preventDefault();
        
        if (!this.validate()) {
          return;
        }

        this.step++;
        if (this.step > this.steps.length) {
          this.step = this.steps.length;
        }
        this.move();
        this.validate();
      });
      this.validate();
    }

    move() {
      this.steps.each(function () {
        $(this).removeClass("active");
      });
      $(this.steps[this.step - 1]).addClass("active");
      this.choosenContainer.eq(0).show();

      this.responsible(this.step - 1);
    }
    validate() {
      return this.refreshUI();
    }
    openModal() {
      $.fancybox.open({
        src: `.pbw-builder-wrapper[data-steps=${this.id}]`,
        type: "inline",
        touch: false,
        buttons: ["close"],
        btnTpl: {
          smallBtn:
            '<button type="button" data-fancybox-close class="fancybox-button fancybox-close-small" title="{{CLOSE}}">' +
            '<svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 24 24"><path d="M13 12l5-5-1-1-5 5-5-5-1 1 5 5-5 5 1 1 5-5 5 5 1-1z" fill="#fff"/></svg>' +
            "</button>",
        },
        opts: {
          afterShow: (instance) => {
            if (FOOD_FRONT_DATA.tippy_enabled) {
              tippy("[data-tippy-content]", {
                appendTo: instance.$refs.container[0],
                zIndex: 99999,
              });
            }

            this.responsible(0);
          },
        },
      });
    }
    chooseComponent(e) {
      const selectedComponent = $(e.target).closest(".pbw-builder-step__component");
      const componentId = selectedComponent.data("component");

      if (this.selectedComponents.includes(componentId)) {
        this.selectedComponents = this.selectedComponents.filter((el) => el !== componentId);
        selectedComponent.removeClass("active");
      } else {
        this.selectedComponents.push(componentId);
        selectedComponent.addClass("active");
      }
      this.inputComponents.val(JSON.stringify(this.selectedComponents));
      this.choosenContainer.eq(0).show();
      this.calculate();
      this.refreshUI();
      this.addTemplate();
    }

    calculate() {
      // console.log(this.data.data.components);
      let summ = 0;
      let includesArray = [];
      this.data.data.components.forEach((step) => {
        step.components.forEach((c) => {
          if (this.selectedComponents.includes(c.id)) {
            if (!includesArray.includes(c.id)) {
              summ += parseFloat(c.price);
              includesArray.push(c.id);
            }
          }
        });
      });
      this.price = summ;
      this.priceContainer.html(ev_wc_price(parseFloat(this.price)));
    }
    refreshUI() {
      const dataCurrentStep = this.data.data.components[this.step - 1];

      let isValid = true;
      if (dataCurrentStep && dataCurrentStep.required) {
        if (dataCurrentStep.components.length > 0) {
          const choosenOne = dataCurrentStep.components.some((c) => this.selectedComponents.includes(c.id));

          if (choosenOne) {
            this.nextButton.attr("disabled", false);

            isValid = true;
          } else {
            this.nextButton.attr("disabled", true);
            isValid = false;
          }
        }
      }
      if (this.step === this.steps.length) {
        this.nextButton.attr("disabled", true);
      }
      if (this.step === this.steps.length) {
        if (isValid) {
          this.buyButton.attr("disabled", false);
        } else {
          this.buyButton.attr("disabled", true);
        }
      } else {
        this.buyButton.attr("disabled", true);
      }

      return isValid;
    }
    addTemplate() {
      const templateChoosen = wp.template("pizza-builder-choosen");
      const dataCurrentStep = this.data.data.components[this.step - 1];
      // const choosenContainer = $(this.steps[this.step-1]).find('.pbw-builder-step__choosen .pbw-builder-step__components');
      // choosenContainer.html('');
      if (dataCurrentStep.components.length > 0) {
        dataCurrentStep.components.forEach((c) => {
          const choosenComponent = this.choosenContainer.find(`[data-choosen=${c.id}]`);
          // console.log(choosenComponent);
          if (this.selectedComponents.includes(c.id) && choosenComponent.length < 1) {
            const templateData = {
              id: c.id,
              name: c.name,
              image: this.stepsModal.find(`.pbw-builder-step__component[data-component=${c.id}]`).find("img").attr("src"),
              price: ev_wc_price(parseFloat(c.price)),
            };
            this.choosenContainer.find(".pbw-builder-step__components").append(templateChoosen(templateData));
          } else if (!this.selectedComponents.includes(c.id) && choosenComponent.length > 0) {
            choosenComponent.remove();
          }
        });
      }
    }
    submit(e) {
      e.preventDefault();
      $(this.buyButton).addClass("loading");
      $(this.buyButton).attr("disabled", true);
      $.ajax({
        url: FOOD_FRONT_DATA.ajax_url,
        type: "POST",
        data: this.form.serialize(),
      })
        .then((res) => {
         
          $(this.buyButton).removeClass("loading");
          $(this.buyButton).attr("disabled", false);

          if (res.cart_hash) {
            this.successContainer.html(
              '<svg width="67" height="67" viewBox="0 0 67 67" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="33.5" cy="33.5" r="33.5" fill="#71DB1A"/><path d="M45.4639 20.3394L30.0023 46.8724L20.3389 35.0799" stroke="white" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg><p>Done!</p>'
            );
            this.successContainer.addClass("active");
            setTimeout(() => {
              this.successContainer.removeClass("active");
            }, 2500);
            if (FOOD_FRONT_DATA.redirect_cart) {
              window.location.href = FOOD_FRONT_DATA.redirect_cart;
            }
          }
        })
        .fail((err) => console.log(err));
    }

    responsible(index) {
      if (window.matchMedia("(max-width: 780px)").matches) {
        if (this.shownSteps.includes(this.step)) {
          return;
        }
        $(".pbw-builder-step__components", $(this.steps[index])).slick({
          slidesToShow: 5,
          infinite: false,
          arrows: false,
          responsive: [
            {
              breakpoint: 500,
              settings: {
                slidesToShow: 3,
              },
            },
            {
              breakpoint: 380,
              settings: {
                slidesToShow: 2,
              },
            },
          ],
        });
        this.shownSteps.push(this.step);
        // $('.pbw-builder-step__components', $(this.steps[index])).slick({
      }
    }
  }

  $(".pbw-builder-button").each(function () {
    new EV_Pizza_Builder($(this).data("steps"));
  });

  window.pizzaRules = pizzaRules;

})(jQuery);
