import React, {useState, useEffect} from "react";
const {render} = wp.element;
const {__} = wp.i18n;
import PropTypes from "prop-types";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionActions from "@mui/material/AccordionActions";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import Collapse from "@mui/material/Collapse";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import Button from "@mui/material/Button";

import InputLabel from "@mui/material/InputLabel";

import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import {v4 as uuid} from "uuid";
import styled from "@emotion/styled";
import Prism from "prismjs";
// import "prismjs/themes/prism-tomorrow.css";
const ComponentMedia = styled(CardMedia)`
  object-fit: contain;

  &:hover {
    cursor: pointer;
  }
`;
const FormControlFull = styled(FormControl)`
  display: flex;
  margin-bottom: 10px;
  margin-right: 5px;
  margin-left: 5px;
`;
const FormControlImage = styled(FormControl)`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  margin-left: 20px;
`;
const FormControllSettings = styled.div`
  display: flex;
  align-items: center;
`;
const AccordionHeaderInner = styled.div`
  display: flex;
  align-items: center;
`;
const CardMediaEdit = styled.img`
  object-fit: contain;
  &:hover {
    cursor: pointer;
  }
`;
const IconButtonAdd = styled(IconButton)`
  background-color: rgb(25, 118, 210);
  :hover {
    background-color: rgb(21, 101, 192);
  }
  color: white;
  margin: 30px;
`;
function PizzaCode(props) {
  const {lang, code} = props;
  useEffect(() => {
    Prism.highlightAll();
  }, []);
  return (
    <pre className="line-numbers">
      <code className={`language-${lang}`}>{code}</code>
    </pre>
  );
}
function TabPanel(props) {
  const {children, value, index, ...other} = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pizza-tabpanel-${index}`}
      aria-labelledby={`pizza-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{p: 3}}>{children}</Box>}
    </div>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};
function tabProps(index) {
  return {
    id: `pizza-tab-${index}`,
    "aria-controls": `pizza-tabpanel-${index}`,
  };
}
const AdminPizza = () => {
  const [tab, setTab] = useState(0);
  const handleChangeTab = (event, newValue) => {
    setTab(newValue);
  };

  const [expanded, setExpanded] = useState({});

  const handleChangeAcc = (id) => (event, newExpanded) => {
    // console.log(id, event, newExpanded);
    setExpanded(
      newExpanded ? {...expanded, [id]: true} : {...expanded, [id]: false}
    );
  };

  const [expandEdit, setExpandEdit] = useState({});
  const handleExpandEdit = (id) => {
    setExpandEdit({...expandEdit, [id]: !expandEdit[id]});
  };
  const [newComponent, setNewComponent] = useState({
    id: uuid(),
    name: "New",
    price: 0,
    weight: "",
    meta: false,
    image_ID: 0,
    image: `${EV_PIZZA_DATA.url}images/placeholder.svg`,
    description: "",
  });
  const [pizzaSettings, setPizzaSettings] = useState(
    EV_PIZZA_DATA.pizza_settings || {
      empty_layer: {
        image: `${EV_PIZZA_DATA.url}images/placeholder.svg`,
      },
      empty_side: {
        image: `${EV_PIZZA_DATA.url}images/placeholder.svg`,
      },
      tipps: {
        enabled: false,
      },
    }
  );
  const [pizzaComponents, setPizzaComponents] = useState(
    EV_PIZZA_DATA.pizza_components || [
      {
        id: uuid(),
        groupName: "group1",
        groupImage: `${EV_PIZZA_DATA.url}images/placeholder.svg`,
        components: [
          {
            id: uuid(),
            name: "Chedar",
            price: 100,
            weight: "",
            meta: false,
            image_ID: 0,
            image: `${EV_PIZZA_DATA.url}images/placeholder.svg`,
            description:
              "This impressive paella is a perfect party dish and a fun meal to cook together with your guests. Add 1 cup of frozen peas along with the mussels, if you like.",
          },
          {
            id: uuid(),
            name: "Gauda",
            price: 120,
            weight: "",
            meta: false,
            image_ID: 0,
            image: `${EV_PIZZA_DATA.url}images/placeholder.svg`,
            description:
              "This impressive paella is a perfect party dish and a fun meal to cook together with your guests. Add 1 cup of frozen peas along with the mussels, if you like.",
          },
        ],
      },
      {
        id: uuid(),
        groupName: "group2",
        groupImage: `${EV_PIZZA_DATA.url}images/placeholder.svg`,
        components: [
          {
            id: uuid(),
            name: "Becon",
            price: 80,
            meta: false,
            weight: "",
            image_ID: 0,
            image: `${EV_PIZZA_DATA.url}images/placeholder.svg`,
            description:
              "This impressive paella is a perfect party dish and a fun meal to cook together with your guests. Add 1 cup of frozen peas along with the mussels, if you like.",
          },
          {
            id: uuid(),
            name: "Sousige",
            price: 85,
            image_ID: 0,
            weight: "",
            meta: false,
            image: `${EV_PIZZA_DATA.url}images/placeholder.svg`,
            description:
              "This impressive paella is a perfect party dish and a fun meal to cook together with your guests. Add 1 cup of frozen peas along with the mussels, if you like.",
          },
        ],
      },
    ]
  );

  let frame;
  const uploadImage = (id) => {
    console.log(id);
    if (frame) {
      frame.open();
      return;
    }
    frame = wp.media({
      multiple: "false",
    });
    frame.on("select", function () {
      let attachment = frame.state().get("selection").first().toJSON();
      console.log(attachment);
      const newPizza = pizzaComponents.map((group) => {
        const newGroup = group.components.map((component) =>
          component.id === id
            ? {
                ...component,
                image: attachment.sizes.hasOwnProperty("thumbnail")
                  ? attachment.sizes.thumbnail.url
                  : attachment.sizes.full.url,
                image_ID: attachment.id,
              }
            : component
        );

        return {...group, components: newGroup};
      });
      setPizzaComponents(newPizza);
      console.log(attachment);
    });
    frame.open();
  };
  const addComponent = (groupId) => {
    const newPizza = pizzaComponents.map((group) => {
      if (group.id === groupId) {
        return {...group, components: [...group.components, newComponent]};
      }
      return group;
    });
    setPizzaComponents(newPizza);
    setNewComponent({...newComponent, id: uuid()});
  };
  const deleteComponent = (id) => {
    const newPizza = pizzaComponents.map((group) => {
      const newComponents = group.components.filter((c) => c.id !== id);
      return {...group, components: newComponents};
    });

    setPizzaComponents(newPizza);
  };
  const setGroupName = (e, groupId) => {
    const newPizza = pizzaComponents.map((group) => {
      return group.id === groupId
        ? {...group, groupName: e.target.value}
        : group;
    });

    setPizzaComponents(newPizza);
  };
  let frameGroup;
  const uploadGroupImage = (id) => {
    if (frameGroup) {
      frameGroup.open();
      return;
    }
    frameGroup = wp.media({
      multiple: "false",
    });
    frameGroup.on("select", function () {
      let attachment = frameGroup.state().get("selection").first().toJSON();
      console.log(attachment);
      const newPizza = pizzaComponents.map((group) => {
        return group.id === id
          ? {
              ...group,
              groupImage: attachment.sizes.hasOwnProperty("thumbnail")
                ? attachment.sizes.thumbnail.url
                : attachment.sizes.full.url,
            }
          : group;
      });
      setPizzaComponents(newPizza);
      console.log(attachment);
    });
    frameGroup.open();
  };
  const setComponentWeight = (e, componentId) => {
    const newPizza = pizzaComponents.map((group) => {
      const newComponent = group.components.map((component) =>
        component.id === componentId
          ? {...component, weight: e.target.value}
          : component
      );
      return {...group, components: newComponent};
    });

    setPizzaComponents(newPizza);
  };
  const setComponentDescription = (e, componentId) => {
    const newPizza = pizzaComponents.map((group) => {
      const newComponent = group.components.map((component) =>
        component.id === componentId
          ? {...component, description: e.target.value}
          : component
      );
      return {...group, components: newComponent};
    });

    setPizzaComponents(newPizza);
  };
  const setComponentName = (e, componentId) => {
    const newPizza = pizzaComponents.map((group) => {
      const newComponent = group.components.map((component) =>
        component.id === componentId
          ? {...component, name: e.target.value}
          : component
      );
      return {...group, components: newComponent};
    });

    setPizzaComponents(newPizza);
  };
  const setComponentPrice = (e, componentId) => {
    const newPizza = pizzaComponents.map((group) => {
      const newComponent = group.components.map((component) =>
        component.id === componentId
          ? {...component, price: e.target.value}
          : component
      );
      return {...group, components: newComponent};
    });

    setPizzaComponents(newPizza);
  };
  const setComponentMeta = (e, componentId) => {
    const newPizza = pizzaComponents.map((group) => {
      const newComponent = group.components.map((component) =>
        component.id === componentId
          ? {...component, meta: e.target.checked}
          : component
      );
      return {...group, components: newComponent};
    });

    setPizzaComponents(newPizza);
  };
  const addGroupPizza = () => {
    setPizzaComponents([
      ...pizzaComponents,
      {
        id: uuid(),
        groupName: "Secondary",
        groupImage: `${EV_PIZZA_DATA.url}images/placeholder.svg`,
        components: [],
      },
    ]);
  };
  const deleteGroup = (id) => {
    setPizzaComponents(pizzaComponents.filter((group) => group.id !== id));
  };
  /////////SETTINGS///////
  let settingFrame;
  const uploadImageSettings = (field) => {
    if (settingFrame) {
      settingFrame.open();
      return;
    }
    settingFrame = wp.media({
      multiple: "false",
    });
    settingFrame.on("select", function () {
      let attachment = settingFrame.state().get("selection").first().toJSON();
      console.log(attachment);

      setPizzaSettings({
        ...pizzaSettings,
        [field]: {
          ...pizzaSettings[field],
          image: attachment.sizes.hasOwnProperty("thumbnail")
            ? attachment.sizes.thumbnail.url
            : attachment.sizes.full.url,
          image_ID: attachment.id,
        },
      });
      console.log(attachment);
    });
    settingFrame.open();
  };
  const setPizzaTips = (e) => {
    setPizzaSettings({
      ...pizzaSettings,
      tipps: {
        enabled: e.target.checked,
      },
    });
  };
  return (
    <Paper>
      <input
        type="hidden"
        name="pizza_settings_data"
        value={JSON.stringify(pizzaSettings)}
      />
      <input
        type="hidden"
        name="pizza_components_data"
        value={JSON.stringify(pizzaComponents)}
      />
      <Box sx={{borderBottom: 1, borderColor: "divider"}}>
        <Tabs value={tab} onChange={handleChangeTab}>
          <Tab label={__("Settings")} {...tabProps(0)} />
          <Tab label={__("Components")} {...tabProps(1)} />
          <Tab label={__("Developers")} {...tabProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={tab} index={0}>
        <FormControllSettings>
          <FormControlLabel
            control={
              <Checkbox
                checked={pizzaSettings.tipps.enabled}
                onChange={setPizzaTips}
                color="primary"
              />
            }
            label={__("Enable tipps")}
          />
        </FormControllSettings>
        <FormControllSettings>
          <FormControlImage>
            <Typography>{__("Empty image for pizza layer")}</Typography>
            <ComponentMedia
              component="img"
              height="100"
              image={pizzaSettings.empty_layer.image}
              alt=""
              onClick={() => uploadImageSettings("empty_layer")}
            />
          </FormControlImage>
        </FormControllSettings>
        <FormControllSettings>
          <FormControlImage>
            <Typography>{__("Empty image for pizza side")}</Typography>
            <ComponentMedia
              component="img"
              height="100"
              image={pizzaSettings.empty_side.image}
              alt=""
              onClick={() => uploadImageSettings("empty_side")}
            />
          </FormControlImage>
        </FormControllSettings>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        {pizzaComponents.map((group) => (
          <Accordion
            expanded={
              expanded.hasOwnProperty(group.id) ? expanded[group.id] : false
            }
            onChange={handleChangeAcc(group.id)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>{group.groupName}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <AccordionHeaderInner>
                <FormControl>
                  <TextField
                    type="text"
                    label={__("Group name")}
                    name="group_name"
                    value={group.groupName}
                    onChange={(e) => setGroupName(e, group.id)}
                  />
                </FormControl>
                <FormControlImage>
                  <Typography>{__("Group image(for tabs)")}</Typography>
                  <ComponentMedia
                    component="img"
                    height="100"
                    image={group.groupImage}
                    alt=""
                    onClick={() => uploadGroupImage(group.id)}
                  />
                </FormControlImage>
              </AccordionHeaderInner>
              <Typography component="h4" variant="h4" sx={{padding: "10px 0"}}>
                {__("Components")}
              </Typography>
              <Grid container spacing={2}>
                {group.components.map((component) => (
                  <Grid item xs={2} md={2} sm={4}>
                    <Card>
                      <CardHeader
                        avatar={
                          <Avatar aria-label="component">
                            {component.name.split("").length > 0
                              ? component.name.split("")[0].toUpperCase()
                              : ""}
                          </Avatar>
                        }
                        action={
                          <div>
                            <IconButton
                              aria-label="edit"
                              color="secondary"
                              onClick={() => handleExpandEdit(component.id)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              color="error"
                              onClick={() => deleteComponent(component.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        }
                        title={component.name}
                        subheader={
                          <span>
                            {component.weight !== "" && `${component.weight}/`}
                            {`${component.price} ${EV_PIZZA_DATA.wc_symbol}`}
                          </span>
                        }
                      ></CardHeader>
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
                          <CardMediaEdit
                            src={component.image}
                            height="50"
                            onClick={() => uploadImage(component.id)}
                          />
                        </FormControlFull>
                        <FormControlFull>
                          <TextField
                            label={__("Weight")}
                            name="component_weight"
                            value={component.weight}
                            onChange={(e) =>
                              setComponentWeight(e, component.id)
                            }
                          />
                        </FormControlFull>
                        <FormControlFull>
                          <TextField
                            label={__("Description")}
                            multiline
                            maxRows={4}
                            value={component.description}
                            onChange={(e) =>
                              setComponentDescription(e, component.id)
                            }
                          />
                        </FormControlFull>
                        <FormControlFull>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={component.meta}
                                onChange={(e) =>
                                  setComponentMeta(e, component.id)
                                }
                                color="warning"
                              />
                            }
                            label={__("Also as meta")}
                          />
                        </FormControlFull>
                      </Collapse>
                      {(expandEdit.hasOwnProperty(component.id)
                        ? !expandEdit[component.id]
                        : true) && (
                        <>
                          <ComponentMedia
                            component="img"
                            height="100"
                            image={component.image}
                            alt=""
                            onClick={() => uploadImage(component.id)}
                          />
                          <CardContent>
                            <Typography variant="body2" color="text.secondary">
                              {component.description}
                            </Typography>
                          </CardContent>
                        </>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
            <AccordionActions>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => addComponent(group.id)}
              >
                {__("Add component")}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => deleteGroup(group.id)}
              >
                {__("Delete group")}
              </Button>
            </AccordionActions>
          </Accordion>
        ))}
        <IconButtonAdd color="inherit" size="large" onClick={addGroupPizza}>
          <AddIcon />
        </IconButtonAdd>
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <PizzaCode
          code={`
          /**
           * Modify data for displaying components
           * @return array $data
           */ 
          add_filter('ev_pizza_components_data', function($data) {
            //
            return $data;
        });
        /**
         * Modify html string for Add Layer title
         * @return string
         */
        add_filter('ev_pizza_add_layer_title', function($html) {
          //default is <span class="pizza-highlight">Add</span><span>layer</span>
          return $html;
        });
        /**
         * Change Add layer button name
         * @return string
         */ 
        add_filter('ev_pizza_add_layer_button', function($name) {
          //
          return $name;
        });
        /**
         * Modify html string for Add side title
         * @return string
         */ 
         add_filter('ev_pizza_add_side_title', function($html) {
          //default is <span class="pizza-highlight">Choose</span><span>side</span>
          return $html;
        });
        /**
         * Change Add side button name
         * @return string
         */ 
        add_filter('ev_pizza_add_side_button', function($name) {
          //
          return $name;
        });
        /**
         * Change 'Components extra:' text
         */
        add_filter('ev_pizza_components_adds_text', function($name, $product_id) {
          //
          return $name; 
        }, 10, 2); 
        /**
         * Change 'Basic Components:' text
         */
        add_filter('ev_pizza_components_basic_text', function($name, $product_id) {
          //
          return $name; 
        }, 10, 2); 
        /**
         * Change 'Layers:' text
         */
        add_filter('ev_pizza_components_layers_text', function($name, $product_id) {
          //
          return $name; 
        }, 10, 2); 
        /**
         * Change 'Side:' text
         */
        add_filter('ev_pizza_components_side_text', function($name, $product_id) {
          //
          return $name; 
        }, 10, 2); 
        /**
         * Change 'Pizza components:' text in description to product
         * @var WC_Order_Item_Meta $meta
         */
        add_filter('ev_pizza_checkout_meta_key', function($name, $meta) {
          //
          return $name; 
        }, 10, 2); 
        /**
         * Change 'Pizza composition' text in description to product
         */
        add_filter('ev_pizza_composition_text', function($name, $product_id) {
          //
          return $name; 
        },10 ,2); 
        
        `}
          lang="php"
        ></PizzaCode>
      </TabPanel>
    </Paper>
  );
};

render(<AdminPizza />, document.getElementById("admin-pizza-app"));
