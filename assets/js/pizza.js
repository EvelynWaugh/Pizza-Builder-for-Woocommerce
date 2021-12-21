(function ($) {
  if (!String.prototype.getDecimals) {
    String.prototype.getDecimals = function () {
      var num = this,
        match = ("" + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
      if (!match) {
        return 0;
      }
      return Math.max(
        0,
        (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0)
      );
    };
  }

  $(".component-buttons").on("click", ".plus, .minus", function () {
    var $qty = $(this).closest(".quantity").find(".component-qty"),
      currentVal = parseFloat($qty.val()),
      max = parseFloat($qty.attr("max")),
      min = parseFloat($qty.attr("min")),
      step = $qty.attr("step");

    // Format values
    if (!currentVal || currentVal === "" || currentVal === "NaN")
      currentVal = 0;
    if (max === "" || max === "NaN") max = "";
    if (min === "" || min === "NaN") min = 0;
    if (
      step === "any" ||
      step === "" ||
      step === undefined ||
      parseFloat(step) === "NaN"
    )
      step = 1;

    // Change the value
    if ($(this).is(".plus")) {
      if (max && currentVal >= max) {
        $qty.val(max);
      } else {
        $qty.val((currentVal + parseFloat(step)).toFixed(step.getDecimals()));
      }
      if ((currentVal + parseFloat(step)).toFixed(step.getDecimals()) >= 1) {
        $qty.addClass("is-active");
        $(this).siblings(".minus").css("display", "block");
      }
    } else {
      if (min && currentVal <= min) {
        $qty.val(min);
      } else if (currentVal > 0) {
        $qty.val((currentVal - parseFloat(step)).toFixed(step.getDecimals()));
      }
      if ((currentVal - parseFloat(step)).toFixed(step.getDecimals()) < 1) {
        $qty.removeClass("is-active");
        $(this).hide();
      }
    }
    $qty.trigger("change");
  });

  function calculateEvPizza() {
    const dataComponents = JSON.parse(
      $(".pizza_components_wrapper").attr("data-pizza")
    );

    const layersEnabled = dataComponents.layers.enabled;
    const sidesEnabled = dataComponents.bortik.enabled;

    const inputLayer = $("[name=pizza-layer-data]");
    const inputSides = $("[name=pizza-sides-data]");
    let initialPrice = $(".pizza_components_wrapper").attr("data-price");
    let addToCartButton = $("form.cart").find(".single_add_to_cart_button");
    let symbol = FOOD_FRONT_DATA.wc_symbol,
      pricePosition = FOOD_FRONT_DATA.price_position,
      wcDecimals = FOOD_FRONT_DATA.decimals || 2;

    const ev_wc_price = (price) => {
      switch (pricePosition) {
        case "left":
          return `${symbol}${price.toFixed(wcDecimals)}`;
        case "right":
          return `${price.toFixed(wcDecimals)}${symbol}`;
        case "left_space":
          return `${symbol} ${price.toFixed(wcDecimals)}`;
        case "right_space":
          return `${price.toFixed(wcDecimals)} ${symbol}`;
      }
    };
    const ev_wc_price_sale = (price, regular_price) => {
      switch (pricePosition) {
        case "left":
          return `<del>${symbol}${regular_price.toFixed(
            wcDecimals
          )}</del><ins>${symbol}${price.toFixed(wcDecimals)}</ins>`;
        case "right":
          return `<del>${regular_price.toFixed(
            wcDecimals
          )}${symbol}</del><ins>${price.toFixed(wcDecimals)}${symbol}</ins>`;
        case "left_space":
          return `<del>${symbol} ${regular_price.toFixed(
            wcDecimals
          )}</del><ins>${symbol} ${price.toFixed(wcDecimals)}</ins>`;
        case "right_space":
          return `<del>${regular_price.toFixed(
            wcDecimals
          )} ${symbol}</del><ins>${price.toFixed(wcDecimals)} ${symbol}</ins>`;
      }
    };
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
            ev_wc_price_sale(
              parseFloat(variation.display_price),
              parseFloat(variation.display_regular_price)
            )
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
                priceConsistsExcl += parseFloat(layer.price);
              }
            });
          });
          summ = summ - priceConsistsExcl;
        }
        $("#add-component .pizza-components-item").each(function () {
          let val = $(this).find(".component-qty").val();
          let componentId = $(this)
            .find(".component-buttons")
            .attr("data-food-item");
          let componentObject = dataComponents.consists_of.to_add.find(
            (component) => component.id === componentId
          );
          // console.log(componentObject);
          if (componentObject !== undefined) {
            summ += parseFloat(componentObject.price) * parseInt(val);
          }
        });
        if ($(".pizza-components-wrapper").length) {
          $(".components-item-wrapper .component-item").each(function () {
            let val = $(this).find(".component-qty").val();
            let componentId = $(this)
              .find(".component-buttons")
              .attr("data-food-item");
            let componentObject = dataComponents.extra.components.find(
              (component) => component.id === componentId
            );
            // console.log(componentObject);
            if (componentObject !== undefined) {
              summ += parseFloat(componentObject.price) * parseInt(val);
            }
          });
        }
        if ($(".pizza-component-tabs-wrapper").length) {
          $(".pizza-component-tabs-wrapper .component-item").each(function () {
            let val = $(this).find(".component-qty").val();
            let componentId = $(this)
              .find(".component-buttons")
              .attr("data-food-item");
            let componentObject = dataComponents.extra.components.find(
              (component) => component.id === componentId
            );
            // console.log(componentObject);
            if (componentObject !== undefined) {
              summ += parseFloat(componentObject.price) * parseInt(val);
            }
          });
        }
        if (layersEnabled) {
          let layersData = selectedIdLayers.filter((el, i) => i !== 0);

          layersData.forEach((el) => {
            let priceLayer = parseFloat(
              $(`[data-layer=${el.id}]`).attr("data-layer-price")
            );
            summ += priceLayer;
          });
        }
        if (sidesEnabled) {
          if (selectedIdSides.length > 0) {
            const findSide = dataComponents.bortik.components.find(
              (el) => el.id === selectedIdSides[0].id
            );
            // console.log(findSide);
            if (findSide) {
              summ += parseFloat(findSide.price);
            }
          }
        }
        refreshPriceHtml(summ);
      };
      const refreshPriceHtml = (summ) => {
        let priceContainer = $("form.variations_form").find(
          ".woocommerce-variation-price .price"
        );
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
          return c.hasOwnProperty(componentId) ? {[key]: !c[componentId]} : c;
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
          !c[key] &&
            $(`[data-component-id=${key}]`)
              .closest(".pizza-components-item")
              .addClass("active");
        });
      };

      const templateEvLayers = () => {
        inputLayer.val(JSON.stringify(selectedIdLayers));
        $(document.body).on(
          "click",
          ".pizza-fancybox-layers .pizza-layer-item",
          function () {
            let product_id = $(this).attr("data-layer");
            let image = $(this).find("img").attr("src");
            let title = $(this).find(".ev-pizza-title").text();
            let price = $(this).find(".ev-pizza-price").html();
            let findElement = selectedIdLayers.findIndex(
              (el) => el.id === product_id
            );
            if (findElement !== -1) {
              return;
            }
            if (selectedIdLayers.length >= 3) return;
            let positionIndexes = selectedIdLayers.map((l) => l.position);
            // console.log(positionIndexes);
            let templateIndexes = [1, 2, 3, 4, 5, 6, 7].filter(
              (i) => !positionIndexes.includes(i)
            );
            // console.log(templateIndexes);
            selectedIdLayers = [
              ...selectedIdLayers,
              {id: product_id, position: Math.min(...templateIndexes)},
            ];
            let indexElement = selectedIdLayers.findIndex(
              (el) => el.id === product_id
            );
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
          }
        );
        $(document.body).on("click", ".ev-remove-layer", function (e) {
          e.preventDefault();
          let product_id = $(this)
            .closest(".pizza-layers-selected__item")
            .attr("data-product-id");

          let index = $(".pizza-layers-selected__item").index(
            $(`[data-product-id=${product_id}]`)
          );
          const templateDefault = wp.template("pizza-layer-default");
          const pizzaDefaultData = {
            name: FOOD_FRONT_DATA.layer_default_text.replace("%s", index + 1),
            image: FOOD_FRONT_DATA.layer_default_image,
            product_id: "",
          };

          $(this)
            .closest(".pizza-layers-selected__item")
            .replaceWith(templateDefault(pizzaDefaultData));

          selectedIdLayers = selectedIdLayers.filter(
            (el) => el.id !== product_id
          );
          inputLayer.val(JSON.stringify(selectedIdLayers));
          calculate();
        });
      };
      const templateEvSides = () => {
        inputSides.val(JSON.stringify(selectedIdSides));
        $(document.body).on(
          "click",
          ".pizza-fancybox-sides .pizza-layer-item",
          function () {
            let side_id = $(this).attr("data-side-id");
            let image = $(this).find("img").attr("src");
            let title = $(this).find(".ev-pizza-title").text();
            let price = $(this).find(".ev-pizza-price").html();

            selectedIdSides = [{id: side_id}];

            inputSides.val(JSON.stringify(selectedIdSides));

            const templateSelected = wp.template("pizza-side-selected");
            const pizzaSelectedData = {
              name: title,
              image: image,
              price: price,
            };
            $(".pizza-fancybox-sides .pizza-sides-selected__item").replaceWith(
              templateSelected(pizzaSelectedData)
            );
            calculate();
          }
        );
        $(document.body).on("click", ".ev-remove-side", function (e) {
          e.preventDefault();

          const templateDefault = wp.template("pizza-side-default");
          const pizzaDefaultData = {
            name: FOOD_FRONT_DATA.side_default_text,
            image: FOOD_FRONT_DATA.side_default_image,
            product_id: "",
          };

          $(this)
            .closest(".pizza-layers-selected__item")
            .replaceWith(templateDefault(pizzaDefaultData));

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
              let layerFancy = $(document.body).find(
                "#ev-pizza-layers-fancybox"
              );
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
              let sideFancy = $(document.body).find(
                "#ev-pizza-bortik-fancybox"
              );
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
    } else if (
      $("form.variations_form").length === 0 &&
      $("form.cart").length > 0
    ) {
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
        $(document.body).on(
          "click",
          ".pizza-fancybox-layers .pizza-layer-item",
          function () {
            let product_id = $(this).attr("data-layer");
            let image = $(this).find("img").attr("src");
            let title = $(this).find(".ev-pizza-title").text();
            let price = $(this).find(".ev-pizza-price").html();
            let findElement = selectedIdLayers.findIndex(
              (el) => el.id === product_id
            );
            if (findElement !== -1) {
              return;
            }
            if (selectedIdLayers.length >= 3) return;
            let positionIndexes = selectedIdLayers.map((l) => l.position);

            let templateIndexes = [1, 2, 3, 4, 5, 6, 7].filter(
              (i) => !positionIndexes.includes(i)
            );

            selectedIdLayers = [
              ...selectedIdLayers,
              {id: product_id, position: Math.min(...templateIndexes)},
            ];
            let indexElement = selectedIdLayers.findIndex(
              (el) => el.id === product_id
            );

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
          }
        );
        $(document.body).on("click", ".ev-remove-layer", function (e) {
          e.preventDefault();
          let product_id = $(this)
            .closest(".pizza-layers-selected__item")
            .attr("data-product-id");

          let index = $(".pizza-layers-selected__item").index(
            $(`[data-product-id=${product_id}]`)
          );
          const templateDefault = wp.template("pizza-layer-default");
          const pizzaDefaultData = {
            name: FOOD_FRONT_DATA.layer_default_text.replace("%s", index + 1),
            image: FOOD_FRONT_DATA.layer_default_image,
            product_id: "",
          };

          $(this)
            .closest(".pizza-layers-selected__item")
            .replaceWith(templateDefault(pizzaDefaultData));

          selectedIdLayers = selectedIdLayers.filter(
            (el) => el.id !== product_id
          );
          inputLayer.val(JSON.stringify(selectedIdLayers));
          calculate();
        });
      };
      const templateEvSides = () => {
        inputSides.val(JSON.stringify(selectedIdSides));
        $(document.body).on(
          "click",
          ".pizza-fancybox-sides .pizza-layer-item",
          function () {
            let side_id = $(this).attr("data-side-id");
            let image = $(this).find("img").attr("src");
            let title = $(this).find(".ev-pizza-title").text();
            let price = $(this).find(".ev-pizza-price").html();

            selectedIdSides = [{id: side_id}];

            inputSides.val(JSON.stringify(selectedIdSides));

            const templateSelected = wp.template("pizza-side-selected");
            const pizzaSelectedData = {
              name: title,
              image: image,
              price: price,
            };
            $(".pizza-fancybox-sides .pizza-sides-selected__item").replaceWith(
              templateSelected(pizzaSelectedData)
            );
            calculate();
          }
        );
        $(document.body).on("click", ".ev-remove-side", function (e) {
          e.preventDefault();

          const templateDefault = wp.template("pizza-side-default");
          const pizzaDefaultData = {
            name: FOOD_FRONT_DATA.side_default_text,
            image: FOOD_FRONT_DATA.side_default_image,
            product_id: "",
          };

          $(this)
            .closest(".pizza-layers-selected__item")
            .replaceWith(templateDefault(pizzaDefaultData));

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
                priceConsistsExcl += parseFloat(layer.price);
              }
            });
          });
          summ = summ - priceConsistsExcl;
        }
        $("#add-component .pizza-components-item").each(function () {
          let val = $(this).find(".component-qty").val();
          let componentId = $(this)
            .find(".component-buttons")
            .attr("data-food-item");
          let componentObject = dataComponents.consists_of.to_add.find(
            (component) => component.id === componentId
          );
          // console.log(componentObject);
          if (componentObject !== undefined) {
            summ += parseFloat(componentObject.price) * parseInt(val);
          }
        });
        if ($(".pizza-components-wrapper").length) {
          $(".components-item-wrapper .component-item").each(function () {
            let val = $(this).find(".component-qty").val();
            let componentId = $(this)
              .find(".component-buttons")
              .attr("data-food-item");
            let componentObject = dataComponents.extra.components.find(
              (component) => component.id === componentId
            );
            // console.log(componentObject);
            if (componentObject !== undefined) {
              summ += parseFloat(componentObject.price) * parseInt(val);
            }
          });
        }
        if ($(".pizza-component-tabs-wrapper").length) {
          $(".pizza-component-tabs-wrapper .component-item").each(function () {
            let val = $(this).find(".component-qty").val();
            let componentId = $(this)
              .find(".component-buttons")
              .attr("data-food-item");
            let componentObject = dataComponents.extra.components.find(
              (component) => component.id === componentId
            );
            // console.log(componentObject);
            if (componentObject !== undefined) {
              summ += parseFloat(componentObject.price) * parseInt(val);
            }
          });
        }
        if (layersEnabled) {
          let layersData = selectedIdLayers.filter((el, i) => i !== 0);

          layersData.forEach((el) => {
            let priceLayer = parseFloat(
              $(`[data-layer=${el.id}]`).attr("data-layer-price")
            );
            summ += priceLayer;
          });
        }
        if (sidesEnabled) {
          if (selectedIdSides.length > 0) {
            const findSide = dataComponents.bortik.components.find(
              (el) => el.id === selectedIdSides[0].id
            );

            if (findSide) {
              summ += parseFloat(findSide.price);
            }
          }
        }
        refreshPriceHtml(summ);
      };
      const refreshPriceHtml = (summ) => {
        let priceContainer = $(".product").find(".price");
        let priceLayerContainer = $(document.body).find(".layers-total-price");

        priceContainer.html(ev_wc_price(summ));
        if (layersEnabled || sidesEnabled) {
          priceLayerContainer.html(ev_wc_price(summ));
        }
      };
      const calculateComponentsRemove = (item) => {
        if (!item.find(".ev-remove-component").length) return;
        let componentId = item.attr("data-component-id");
        let inputConsists = $("input[name=ev-pizza-consists]");
        let inputValue = JSON.parse(inputConsists.val());
        let modiFiedData = inputValue.map((c) => {
          let key = Object.keys(c)[0];
          return c.hasOwnProperty(componentId) ? {[key]: !c[componentId]} : c;
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
          !c[key] &&
            $(`[data-component-id=${key}]`)
              .closest(".pizza-components-item")
              .addClass("active");
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
              let layerFancy = $(document.body).find(
                "#ev-pizza-layers-fancybox"
              );
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
              let sideFancy = $(document.body).find(
                "#ev-pizza-bortik-fancybox"
              );
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
      $self.css({position: "relative"});
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
})(jQuery);
