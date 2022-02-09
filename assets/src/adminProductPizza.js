import React, {useState, useEffect} from "react";
const {render} = wp.element;
const {__} = wp.i18n;
const {flatten, differenceBy} = lodash;
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import Autocomplete from "@mui/material/Autocomplete";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Grid from "@mui/material/Grid";

import Collapse from "@mui/material/Collapse";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import styled from "@emotion/styled";

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 48 * 4.5 + 8,
      width: 250,
    },
  },
};

const ProductBox = styled(Box)`
  display: ${(props) => (props.show ? "block" : "none")};
`;
const FormControlFull = styled(FormControl)`
  display: flex;
  margin-bottom: 10px;
  margin-right: 5px;
  margin-left: 5px;
`;
const ComponentMedia = styled(CardMedia)`
  object-fit: contain;

  &:hover {
    cursor: pointer;
  }
`;
const CardMediaEdit = styled.img`
  object-fit: contain;
  &:hover {
    cursor: pointer;
  }
`;
const CardHeaderComponent = styled(CardHeader)`
  & .MuiCardHeader-title {
    font-size: 16px;
  }
`;
function AdminProductFood() {
  const [pizzaComponents, setPizzaComponents] = useState(
    EV_IL_DATA.pizza_components || []
  );
  const [foodComponents, setFoodComponents] = useState(
    EV_IL_DATA.food_components || []
  );

  const [foodComponentsFull, setFoodComponentsFull] = useState(
    EV_IL_DATA.food_components_full || []
  );
  const [productPizzaFull, setProductPizzaFull] = useState(
    EV_IL_DATA.product_ev_pizza_full || {
      consists_of: {
        enabled: false,
        consists: [],

        to_add: [],
      },
      extra: {
        enabled: true,
        tabs: false,
        tab_components: [],
        components: [],
      },
      layers: {
        enabled: false,
        components: [],
      },
      bortik: {
        enabled: false,
        components: [],
      },
      ev_inc: false,
    }
  );
  console.log(EV_IL_DATA.products);
  const [switchState, setSwitchState] = useState({
    consists_of: EV_IL_DATA.product_ev_pizza_full
      ? EV_IL_DATA.product_ev_pizza_full.consists_of.enabled
      : false,
    extra: EV_IL_DATA.product_ev_pizza_full
      ? EV_IL_DATA.product_ev_pizza_full.extra.enabled
      : true,
  });

  const handleMetaVisible = (e) => {
    setProductPizzaFull({
      ...productPizzaFull,
      bortik: {
        ...productPizzaFull.bortik,
        enabled: e.target.checked,
      },
    });
  };
  const handleLayerVisible = (e) => {
    setProductPizzaFull({
      ...productPizzaFull,
      layers: {
        ...productPizzaFull.layers,
        enabled: e.target.checked,
      },
    });
  };
  const handleSwitchChange = (e) => {
    setSwitchState({
      consists_of: !switchState.consists_of,
      extra: !switchState.extra,
    });
  };
  useEffect(() => {
    const allMetas = flatten(
      pizzaComponents.map((group) => group.components)
    ).filter((comp) => comp.meta);
    const metasToAdd = differenceBy(
      allMetas,
      productPizzaFull.bortik.components,
      "id"
    );
    let bortikMod = [];
    productPizzaFull.bortik.components.forEach((c) => {
      allMetas.forEach((c2) => {
        if (c.id === c2.id) {
          bortikMod.push({
            ...c,
            image_ID: c2.image_ID,
            image: c2.image,
            name: c2.name,
          });
        }
      });
    });

    setTimeout(() => {
      if (metasToAdd.length > 0) {
        setProductPizzaFull({
          ...productPizzaFull,
          bortik: {
            ...productPizzaFull.bortik,
            components: [...productPizzaFull.bortik.components, ...metasToAdd],
          },
        });
      }
      if (productPizzaFull.bortik.components.length) {
        setProductPizzaFull({
          ...productPizzaFull,
          bortik: {
            ...productPizzaFull.bortik,
            components: bortikMod,
          },
        });
      }
    }, 1000);
  }, []);
  useEffect(() => {
    setProductPizzaFull({
      ...productPizzaFull,
      consists_of: {
        ...productPizzaFull.consists_of,
        enabled: switchState.consists_of,
      },
      extra: {...productPizzaFull.extra, enabled: switchState.extra},
    });
  }, [switchState]);

  const [expandEdit, setExpandEdit] = useState({});
  const handleExpandEdit = (id) => {
    setExpandEdit({...expandEdit, [id]: !expandEdit[id]});
  };
  const [expandEditMeta, setExpandEditMeta] = useState({});
  const handleExpandEditMeta = (id) => {
    setExpandEditMeta({...expandEditMeta, [id]: !expandEditMeta[id]});
  };
  const handleChangeFood = (e, type) => {
    if (e.target.value === "") return;
    const selectedValues =
      typeof e.target.value === "string"
        ? e.target.value.split(",")
        : e.target.value;

    const selectedComponents = selectedValues.map((id) => {
      const foundComponent = flatten(
        pizzaComponents.map((group) => group.components)
      ).find((component) => {
        return component.id === id;
      });
      return foundComponent;
    });
    console.log(selectedComponents);

    if (type === "extra") {
      if (productPizzaFull.extra.tabs) {
        const selectedTabComponents = pizzaComponents.map((group) => {
          const newPizza = group.components.filter(
            (component) => selectedValues.indexOf(component.id) !== -1
          );
          return {...group, components: newPizza};
        });
        setProductPizzaFull({
          ...productPizzaFull,
          extra: {
            ...productPizzaFull.extra,
            tab_components: selectedTabComponents.filter(
              (group) => group.components.length > 0
            ),
            components: selectedComponents,
          },
        });
      } else {
        setProductPizzaFull({
          ...productPizzaFull,
          extra: {...productPizzaFull.extra, components: selectedComponents},
        });
      }
    } else if (type === "consist") {
      const selectedComponentsModified = selectedValues.map((id) => {
        const foundComponent = flatten(
          pizzaComponents.map((group) => group.components)
        ).find((component) => {
          return component.id === id;
        });
        return {
          ...foundComponent,
          position: "",
          required: false,
          visible: true,
        };
      });
      setProductPizzaFull({
        ...productPizzaFull,
        consists_of: {
          ...productPizzaFull.consists_of,
          consists: selectedComponentsModified,
        },
      });
    } else if (type === "add") {
      setProductPizzaFull({
        ...productPizzaFull,
        consists_of: {
          ...productPizzaFull.consists_of,
          to_add: selectedComponents,
        },
      });
    }
  };
  /////
  const setComponentWeight = (e, componentId) => {
    const newPizza = productPizzaFull.consists_of.consists.map((component) => {
      return component.id === componentId
        ? {...component, weight: e.target.value}
        : component;
    });

    setProductPizzaFull({
      ...productPizzaFull,
      consists_of: {
        ...productPizzaFull.consists_of,
        consists: newPizza,
      },
    });
  };
  const setComponentDescription = (e, componentId) => {
    const newPizza = productPizzaFull.consists_of.consists.map((component) => {
      return component.id === componentId
        ? {...component, description: e.target.value}
        : component;
    });

    setProductPizzaFull({
      ...productPizzaFull,
      consists_of: {
        ...productPizzaFull.consists_of,
        consists: newPizza,
      },
    });
  };
  const setComponentName = (e, componentId) => {
    const newPizza = productPizzaFull.consists_of.consists.map((component) => {
      return component.id === componentId
        ? {...component, name: e.target.value}
        : component;
    });

    setProductPizzaFull({
      ...productPizzaFull,
      consists_of: {
        ...productPizzaFull.consists_of,
        consists: newPizza,
      },
    });
  };
  const setComponentPrice = (e, componentId) => {
    const newPizza = productPizzaFull.consists_of.consists.map((component) => {
      return component.id === componentId
        ? {...component, price: e.target.value}
        : component;
    });

    setProductPizzaFull({
      ...productPizzaFull,
      consists_of: {
        ...productPizzaFull.consists_of,
        consists: newPizza,
      },
    });
  };
  const setComponentRequired = (e, componentId) => {
    const newPizza = productPizzaFull.consists_of.consists.map((component) => {
      return component.id === componentId
        ? {...component, required: e.target.checked}
        : component;
    });

    setProductPizzaFull({
      ...productPizzaFull,
      consists_of: {
        ...productPizzaFull.consists_of,
        consists: newPizza,
      },
    });
  };
  const setComponentVisible = (e, componentId) => {
    const newPizza = productPizzaFull.consists_of.consists.map((component) => {
      return component.id === componentId
        ? {...component, visible: e.target.checked}
        : component;
    });

    setProductPizzaFull({
      ...productPizzaFull,
      consists_of: {
        ...productPizzaFull.consists_of,
        consists: newPizza,
      },
    });
  };
  const setComponentMetaName = (e, componentId) => {
    const newPizza = productPizzaFull.bortik.components.map((component) => {
      return component.id === componentId
        ? {...component, name: e.target.value}
        : component;
    });

    setProductPizzaFull({
      ...productPizzaFull,
      bortik: {
        ...productPizzaFull.bortik,
        components: newPizza,
      },
    });
  };
  const setComponentMetaPrice = (e, componentId) => {
    const newPizza = productPizzaFull.bortik.components.map((component) => {
      return component.id === componentId
        ? {...component, price: e.target.value}
        : component;
    });

    setProductPizzaFull({
      ...productPizzaFull,
      bortik: {
        ...productPizzaFull.bortik,
        components: newPizza,
      },
    });
  };
  const setComponentMetaWeight = (e, componentId) => {
    const newPizza = productPizzaFull.bortik.components.map((component) => {
      return component.id === componentId
        ? {...component, weight: e.target.value}
        : component;
    });

    setProductPizzaFull({
      ...productPizzaFull,
      bortik: {
        ...productPizzaFull.bortik,
        components: newPizza,
      },
    });
  };
  const setLayerProducts = (e, val) => {
    setProductPizzaFull({
      ...productPizzaFull,
      layers: {
        ...productPizzaFull.layers,
        components: val,
      },
    });
  };
  const handleChangeTabs = (e) => {
    const selectedComponentIds = productPizzaFull.extra.components.map(
      (component) => component.id
    );
    const selectedComponents = pizzaComponents.map((group) => {
      const newPizza = group.components.filter(
        (component) => selectedComponentIds.indexOf(component.id) !== -1
      );
      return {...group, components: newPizza};
    });
    setProductPizzaFull({
      ...productPizzaFull,
      extra: {
        ...productPizzaFull.extra,
        tabs: e.target.checked,
        tab_components: selectedComponents.filter(
          (group) => group.components.length > 0
        ),
      },
    });
  };
  const handleChangeInc = (e) => {
    setProductPizzaFull({
      ...productPizzaFull,
      ev_inc: e.target.checked,
    });
  };
  return (
    <div style={{padding: "20px"}}>
      <input
        type="hidden"
        name="product_ev_components_data"
        value={JSON.stringify(foodComponents)}
      />
      <input
        type="hidden"
        name="product_ev_components"
        value={JSON.stringify(foodComponentsFull)}
      />

      <input
        type="hidden"
        name="product_ev_pizza_full"
        value={JSON.stringify(productPizzaFull)}
      />

      <Box>
        <div>
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={productPizzaFull.ev_inc}
                  onChange={handleChangeInc}
                  name="ev_pizza_price_inc"
                />
              }
              label={__(
                "Add components price to product price(if 'Consist of' block enabled)"
              )}
            />
          </FormControl>
        </div>
        <FormControl>
          <label className="ev_pizza_label" htmlFor="extra">
            {__("Extra components block")}
          </label>
          <Switch
            id="extra"
            checked={switchState.extra}
            onChange={handleSwitchChange}
            color="warning"
          />
        </FormControl>
        <FormControl style={{marginLeft: "50px"}}>
          <label className="ev_pizza_label" htmlFor="consists_of">
            {__("Consists of(default for pizza ingredients)")}
          </label>
          <Switch
            id="consists_of"
            checked={switchState.consists_of}
            onChange={handleSwitchChange}
            color="warning"
          />
        </FormControl>
      </Box>
      <ProductBox show={switchState.extra}>
        <FormControl sx={{m: 1, width: 400}}>
          <InputLabel id="food-multiple-chip-label">
            {__("Add extra components")}
          </InputLabel>
          <Select
            labelId="food-multiple-chip-label"
            id="food-multiple-chip"
            multiple
            value={productPizzaFull.extra.components.map(
              (component) => component.id
            )}
            onChange={(e) => handleChangeFood(e, "extra")}
            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
            renderValue={(selected) => (
              <Box sx={{display: "flex", flexWrap: "wrap", gap: 0.5}}>
                {selected.map((value) => {
                  const foundLabel = flatten(
                    pizzaComponents.map((group) => group.components)
                  ).find((component) => {
                    return component.id === value;
                  });

                  return <Chip key={value} label={foundLabel.name} />;
                })}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {pizzaComponents.map((group) => {
              return [
                <ListSubheader
                  color="primary"
                  sx={{fontSize: "20px", fontWeight: "bold"}}
                >
                  {group.groupName}
                </ListSubheader>,
                group.components.map((component) => {
                  return (
                    <MenuItem
                      key={component.id}
                      value={component.id}
                      //   style={getStyles(name, personName, theme)}
                    >
                      {component.name}
                    </MenuItem>
                  );
                }),
              ];
            })}
          </Select>
        </FormControl>
        <div>
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={productPizzaFull.extra.tabs}
                  onChange={handleChangeTabs}
                />
              }
              label={__("With tabs")}
            />
          </FormControl>
        </div>
      </ProductBox>
      <ProductBox show={switchState.consists_of}>
        <FormControl sx={{m: 1, width: 400}}>
          <InputLabel id="food-consists-chip-label">
            {__("Consists of components")}
          </InputLabel>
          <Select
            labelId="food-consists-chip-label"
            id="food-consists-chip"
            multiple
            value={productPizzaFull.consists_of.consists.map(
              (component) => component.id
            )}
            onChange={(e) => handleChangeFood(e, "consist")}
            input={<OutlinedInput id="select-consists-chip" />}
            renderValue={(selected) => (
              <Box sx={{display: "flex", flexWrap: "wrap", gap: 0.5}}>
                {selected.map((value) => {
                  const foundLabel = flatten(
                    pizzaComponents.map((group) => group.components)
                  ).find((component) => {
                    return component.id === value;
                  });

                  return <Chip key={value} label={foundLabel.name} />;
                })}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {pizzaComponents.map((group) => {
              return [
                <ListSubheader
                  color="primary"
                  sx={{fontSize: "20px", fontWeight: "bold"}}
                >
                  {group.groupName}
                </ListSubheader>,
                group.components.map((component) => {
                  return (
                    <MenuItem
                      key={component.id}
                      value={component.id}
                      //   style={getStyles(name, personName, theme)}
                    >
                      {component.name}
                    </MenuItem>
                  );
                }),
              ];
            })}
          </Select>
        </FormControl>

        <FormControl sx={{m: 1, width: 400}}>
          <InputLabel id="food-add-chip-label">
            {__("Add extra components")}
          </InputLabel>
          <Select
            labelId="food-add-chip-label"
            id="food-add-chip"
            multiple
            value={productPizzaFull.consists_of.to_add.map(
              (component) => component.id
            )}
            onChange={(e) => handleChangeFood(e, "add")}
            input={<OutlinedInput id="select-add-chip" />}
            renderValue={(selected) => (
              <Box sx={{display: "flex", flexWrap: "wrap", gap: 0.5}}>
                {selected.map((value) => {
                  const foundLabel = flatten(
                    pizzaComponents.map((group) => group.components)
                  ).find((component) => {
                    return component.id === value;
                  });

                  return <Chip key={value} label={foundLabel.name} />;
                })}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {pizzaComponents.map((group) => {
              return [
                <ListSubheader
                  color="primary"
                  sx={{fontSize: "20px", fontWeight: "bold"}}
                >
                  {group.groupName}
                </ListSubheader>,
                group.components.map((component) => {
                  return (
                    <MenuItem
                      key={component.id}
                      value={component.id}
                      //   style={getStyles(name, personName, theme)}
                    >
                      {component.name}
                    </MenuItem>
                  );
                }),
              ];
            })}
          </Select>
        </FormControl>
        <Typography component="h4" variant="h4">
          {__("Consists of:")}
        </Typography>
        <Grid container spacing={2}>
          {productPizzaFull.consists_of.consists.map((component) => (
            <Grid item xs={2} md={2} sm={4}>
              <Card>
                <CardHeaderComponent
                  action={
                    <div>
                      <IconButton
                        aria-label="edit"
                        color="secondary"
                        onClick={() => handleExpandEdit(component.id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  }
                  title={<span>{component.name}</span>}
                  subheader={
                    <span>
                      {component.weight !== "" && `${component.weight}/`}
                      {`${component.price} ${EV_IL_DATA.wc_symbol}`}
                    </span>
                  }
                ></CardHeaderComponent>
                <Collapse
                  in={
                    expandEdit.hasOwnProperty(component.id)
                      ? expandEdit[component.id]
                      : false
                  }
                  timeout="auto"
                  unmountOnExit
                >
                  <FormControlFull>
                    <TextField
                      type="text"
                      label={__("Name")}
                      name="component_name"
                      value={component.name}
                      onChange={(e) => setComponentName(e, component.id)}
                    />
                  </FormControlFull>
                  <FormControlFull>
                    <TextField
                      type="text"
                      label={__("Price")}
                      name="component_price"
                      value={component.price}
                      onChange={(e) => setComponentPrice(e, component.id)}
                    />
                  </FormControlFull>

                  <FormControlFull>
                    <TextField
                      label={__("Weight")}
                      name="component_weight"
                      value={component.weight}
                      onChange={(e) => setComponentWeight(e, component.id)}
                    />
                  </FormControlFull>
                  <FormControlFull>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={component.required}
                          onChange={(e) =>
                            setComponentRequired(e, component.id)
                          }
                          color="warning"
                        />
                      }
                      label={__("Required")}
                    />
                  </FormControlFull>
                  <FormControlFull>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={component.visible}
                          onChange={(e) => setComponentVisible(e, component.id)}
                          color="warning"
                        />
                      }
                      label={__("Visible")}
                    />
                  </FormControlFull>
                </Collapse>
                {(expandEdit.hasOwnProperty(component.id)
                  ? !expandEdit[component.id]
                  : true) && (
                  <ComponentMedia
                    component="img"
                    height="50"
                    image={component.image}
                    alt=""
                  />
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
        <div>
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={productPizzaFull.bortik.enabled}
                  onChange={handleMetaVisible}
                  color="primary"
                />
              }
              label={__("Use meta (default for pizza sides)")}
            />
          </FormControl>
        </div>
        {productPizzaFull.bortik.enabled && (
          <Grid container spacing={2}>
            {productPizzaFull.bortik.components.map((component) => (
              <Grid item xs={2} md={2} sm={4}>
                <Card>
                  <CardHeaderComponent
                    action={
                      <div>
                        <IconButton
                          aria-label="edit"
                          color="secondary"
                          onClick={() => handleExpandEditMeta(component.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </div>
                    }
                    title={<span>{component.name}</span>}
                    subheader={
                      <span>
                        {component.weight !== "" && `${component.weight}/`}
                        {`${component.price} ${EV_IL_DATA.wc_symbol}`}
                      </span>
                    }
                  ></CardHeaderComponent>
                  <Collapse
                    in={
                      expandEditMeta.hasOwnProperty(component.id)
                        ? expandEditMeta[component.id]
                        : false
                    }
                    timeout="auto"
                    unmountOnExit
                  >
                    <FormControlFull>
                      <TextField
                        type="text"
                        label={__("Name")}
                        name="component_name"
                        value={component.name}
                        onChange={(e) => setComponentMetaName(e, component.id)}
                      />
                    </FormControlFull>
                    <FormControlFull>
                      <TextField
                        type="text"
                        label={__("Price")}
                        name="component_price"
                        value={component.price}
                        onChange={(e) => setComponentMetaPrice(e, component.id)}
                      />
                    </FormControlFull>

                    <FormControlFull>
                      <TextField
                        label={__("Weight")}
                        name="component_weight"
                        value={component.weight}
                        onChange={(e) =>
                          setComponentMetaWeight(e, component.id)
                        }
                      />
                    </FormControlFull>
                  </Collapse>
                  {(expandEditMeta.hasOwnProperty(component.id)
                    ? !expandEditMeta[component.id]
                    : true) && (
                    <ComponentMedia
                      component="img"
                      height="50"
                      image={component.image}
                      alt=""
                    />
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        <div>
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={productPizzaFull.layers.enabled}
                  onChange={handleLayerVisible}
                  color="primary"
                />
              }
              label={__("Enable layer (default for pizza)")}
            />
          </FormControl>
        </div>
        {productPizzaFull.layers.enabled && (
          <Autocomplete
            multiple
            id="products-outlined"
            options={EV_IL_DATA.products}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={productPizzaFull.layers.components}
            filterSelectedOptions
            onChange={setLayerProducts}
            renderInput={(params) => (
              <TextField
                {...params}
                label={__("Products")}
                placeholder={__("Product")}
              />
            )}
          />
        )}
      </ProductBox>
    </div>
  );
}

render(<AdminProductFood />, document.getElementById("ilfood_data"));
