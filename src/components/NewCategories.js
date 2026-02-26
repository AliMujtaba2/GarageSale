import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import { darkTheme, lightTheme } from "../constants/colors";
import { CheckBox } from "@rneui/themed";
import OPSaleVG from "../svg/OPSVG";
import MarketSVG from "../svg/marketSV";
import CarBootSVG from "../svg/CarbootSVG";
import EstateSVG from "../svg/realEstate";
import GarageSaleSVG from "../svg/GarageSale";
import ArrowUpSVG from "../svg/Arrowup";
import ArrowDownSVG from "../svg/ArrowDown";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Minimal change version:
 *  - Normalizes `category` prop so both older array shape and new object shape work.
 *  - Adds helper `isSelected(item)` to safely check selection.
 *  - Rest of your logic is left intact.
 */

const NewCategoriesSelector = ({ category = [], setCategory, disableOther = false }) => {
  const [expanded, setExpanded] = useState({
    garage: true,
    market: false,
    opShop: false,
    carBoot: false,
    estate: false,
  });
   const isDark = useSelector((state) => state.theme.theme === 'dark');
  const colors = isDark ? darkTheme : lightTheme;

  // ---------- Normalization ----------
  // Accept either:
  // 1) old-style: category = ["Garage Sale", "Books, Toys & Games", ...]
  // 2) new-style: category = { parent: "Garage Sale", subcategories: ["Books, Toys & Games"] }
  const categoryObj =
    category && typeof category === "object" && !Array.isArray(category)
      ? {
          parent: category.parent || "",
          subcategories: Array.isArray(category.subcategories) ? category.subcategories : [],
        }
      : null;

  // unified array of selected items for code that expects array
  const selectedArray = categoryObj
    ? // include parent (if any) and subs
      [...(categoryObj.parent ? [categoryObj.parent] : []), ...categoryObj.subcategories]
    : Array.isArray(category)
    ? category
    : [];

  // safe helper to check if an item (parent title or sub) is selected
  const isSelected = (item) => {
    if (!item) return false;
    return selectedArray.includes(item);
  };
  // ------------------------------------

  const data = [
    {
      key: "garage",
      icon: <GarageSaleSVG />,
      title: "Garage Sale",
      subcategories: [
        "Clothing & Accessories",
        "Furniture & Home Décor",
        "Electronics & Gadgets",
        "Books, Toys & Games",
        "Tools & Gardening Equipment",
        "Collectibles & Antiques",
        "Miscellaneous Household Items",
      ],
    },
    {
      key: "market",
      icon: <MarketSVG />,
      title: "Market",
      subcategories: [
        "Farmers Market",
        "Flea Market",
        "Street Market",
        "Craft Market",
        "Night Market",
      ],
    },
    {
      key: "opShop",
      icon: <OPSaleVG />,
      title: "Op Shop",
      subcategories: [
        "Clothing & Shoes",
        "Furniture & Appliances",
        "Books, Music & Media",
        "Homeware & Kitchen Items",
        "Vintage & Collectibles",
      ],
    },
    {
      key: "carBoot",
      icon: <CarBootSVG />,
      title: "Car Boot Sale",
      subcategories: [
        "Accessories",
        "CDs, DVDs & Games",
        "Small Electronics",
        "Tools & Hardware",
        "Books & Collectibles",
        "Miscellaneous",
      ],
    },
    {
      key: "estate",
      icon: <EstateSVG />,
      title: "Estate Sale",
      subcategories: [
        "Residential Property",
        "Commercial Property",
        "Land / Agricultural Property",
      ],
    },
  ];

  // helper: find parent key for given item (title or sub)
  const findParentKeyForItem = (item) => {
    const parent = data.find((d) => d.title === item || d.subcategories.includes(item));
    return parent ? parent.key : null;
  };

  const getActiveParentKey = () => {
    for (const d of data) {
      if (isSelected(d.title)) return d.key;
    }
    for (const d of data) {
      if (d.subcategories.some((s) => isSelected(s))) return d.key;
    }
    return null;
  };

  const activeParentKey = getActiveParentKey();

  const toggleExpand = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ---------- toggleCategory should work with both shapes ----------
  const toggleCategory = (selected) => {
    // if incoming prop is new-style object, we will update via setCategory with same shape
    if (categoryObj) {
      // handle object shape
      const parentForSelected = findParentKeyForItem(selected);
      const parentObj = data.find((d) => d.key === parentForSelected);

      // is selected a parent title?
      if (parentObj && parentObj.title === selected) {
        // toggle parent: selecting parent should set parent and clear subs, unselect removes all
        if (categoryObj.parent === selected) {
          setCategory({ parent: "", subcategories: [] });
        } else {
          setCategory({ parent: selected, subcategories: [] });
        }
        return;
      }

      // selected is a subcategory
      if (parentObj) {
        // if disableOther and there is a different active parent -> ignore
        if (disableOther && activeParentKey && findParentKeyForItem(categoryObj.parent) !== parentObj.key && categoryObj.parent) {
          return;
        }

        const already = categoryObj.subcategories.includes(selected);
        let newSubs;
        if (already) {
          newSubs = categoryObj.subcategories.filter((s) => s !== selected);
          if (newSubs.length === 0) {
            // remove parent too if no subs left
            setCategory({ parent: "", subcategories: [] });
            return;
          } else {
            setCategory({ parent: categoryObj.parent || parentObj.title, subcategories: newSubs });
            return;
          }
        } else {
          // add sub. If parent not present, set it.
          const newParent = categoryObj.parent || parentObj.title;
          newSubs = [...categoryObj.subcategories, selected];
          setCategory({ parent: newParent, subcategories: newSubs });
          return;
        }
      }

      // fallback no-op
      return;
    }

    // else old array shape (backwards compatibility)
    const current = Array.isArray(category) ? [...category] : [];
    const selectedParentKey = findParentKeyForItem(selected);
    const parentObj = data.find((d) => d.key === selectedParentKey);
    const isParent = parentObj && parentObj.title === selected;
    const isSub = parentObj && parentObj.subcategories.includes(selected);

    if (!disableOther) {
      if (current.includes(selected)) {
        const newList = current.filter((c) => c !== selected);
        if (isSub && parentObj) {
          const stillSelected = parentObj.subcategories.some((s) => newList.includes(s));
          if (!stillSelected) {
            const cleaned = newList.filter((c) => c !== parentObj.title);
            setCategory(cleaned);
            return;
          }
        }
        setCategory(newList);
      } else {
        const updated = [...current, selected];
        if (isSub && parentObj && !updated.includes(parentObj.title)) {
          updated.push(parentObj.title);
        }
        setCategory(updated);
      }
      return;
    }

    // disableOther true (array-shape logic)
    if (!activeParentKey) {
      if (isParent) {
        setCategory([parentObj.title]);
        return;
      }
      if (isSub) {
        setCategory([parentObj.title, selected]);
        return;
      }
      return;
    }

    if (selectedParentKey === activeParentKey) {
      if (current.includes(selected)) {
        const newList = current.filter((c) => c !== selected);
        if (isSub && parentObj) {
          const stillSelected = parentObj.subcategories.some((s) => newList.includes(s));
          if (!stillSelected) {
            const cleaned = newList.filter((c) => c !== parentObj.title);
            setCategory(cleaned);
            return;
          }
        }
        if (isParent) {
          const cleaned = newList.filter((c) => !parentObj.subcategories.includes(c));
          setCategory(cleaned);
          return;
        }
        setCategory(newList);
      } else {
        const updated = [...current, selected];
        if (isSub && !updated.includes(parentObj.title)) {
          updated.push(parentObj.title);
        }
        setCategory(updated);
      }
      return;
    }

    // trying to select other parent while one active -> ignore
    return;
  };
  // -------------------------------------------------------------------

  return (
    <ScrollView style={{...styles.container , backgroundColor: colors.background}} showsVerticalScrollIndicator={false}>
      <Text style={{...styles.heading, color: colors.text}}>Select Categories</Text>

      {data.map((section) => {
        const parentSelected = isSelected(section.title);
        const isSectionDisabled = disableOther && activeParentKey && activeParentKey !== section.key;

        return (
          <View key={section.key} style={styles.section}>
            <TouchableOpacity
              style={styles.parentRow}
              onPress={() => toggleExpand(section.key)}
              activeOpacity={0.8}
            >
              <CheckBox
                checked={parentSelected}
                disabled={isSectionDisabled}
                onPress={() => toggleCategory(section.title)}
                checkedColor="#4c56af"
                uncheckedColor="#ccc"
                containerStyle={[styles.checkboxContainer, isSectionDisabled && { opacity: 0.4 }]}
              />

              <View style={styles.iconPlaceholder}>{section.icon}</View>
              <Text style={[styles.parentTitle, { color: isSectionDisabled ? "#aaa" : colors.text }]}>{section.title}</Text>
              <View style={styles.arrowIcon}>
                {expanded[section.key] ? <ArrowUpSVG color={colors.text} /> : <ArrowDownSVG color={colors.text} />}
              </View>
            </TouchableOpacity>

            {expanded[section.key] && (
              <View style={styles.subList}>
                {section.subcategories.map((sub, index) => {
                  const isSubSelected = isSelected(sub);
                  const isDisabled = disableOther && activeParentKey && activeParentKey !== section.key;

                  return (
                    <CheckBox
                      key={index}
                      title={sub}
                      checked={isSubSelected}
                      disabled={isDisabled}
                      onPress={() => toggleCategory(sub)}
                      checkedColor="#4c56af"
                      uncheckedColor="#ccc"
                      containerStyle={[styles.subCheckboxContainer, isDisabled && { opacity: 0.4 }]}
                      textStyle={{...styles.subText, color: colors.text}}
                    />
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingBottom: 50,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginLeft: 20,
    marginBottom: 12,
  },
  section: {
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 5,
  },
  parentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  checkboxContainer: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 10,
    margin: 0,
  },
  iconPlaceholder: {
    width: 28,
    height: 28,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  parentTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1c",
  },
  arrowIcon: {
    marginLeft: 8,
  },
  subList: {
    marginLeft: 55,
  },
  subCheckboxContainer: {
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingVertical: 4,
  },
  subText: {
    fontSize: 15,
    color: "#312a72ff",
    fontWeight: "600",
  },
});

export default NewCategoriesSelector;
