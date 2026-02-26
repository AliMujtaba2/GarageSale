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

const NewCategoriesSelector = ({
    category = [],
    setCategory,
    disableOther = false,
}) => {
    const [expanded, setExpanded] = useState({
        garage: true,
        market: false,
        opShop: false,
        carBoot: false,
        estate: false,
    });

    // Always treat category as array internally
    const safeCategory = Array.isArray(category) ? category : [];

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

    const findParentKeyForItem = (item) => {
        const parent = data.find(
            (d) => d.title === item || d.subcategories.includes(item)
        );
        return parent ? parent.key : null;
    };

    const getActiveParentKey = () => {
        for (const d of data) {
            if (safeCategory.includes(d.title)) return d.key;
        }
        for (const d of data) {
            if (d.subcategories.some((s) => safeCategory.includes(s))) return d.key;
        }
        return null;
    };

    const activeParentKey = getActiveParentKey();

    const toggleExpand = (key) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleCategory = (selected) => {
        const current = Array.isArray(safeCategory) ? [...safeCategory] : [];

        const selectedParentKey = findParentKeyForItem(selected);
        const parentObj = data.find((d) => d.key === selectedParentKey);
        const isParent = parentObj && parentObj.title === selected;
        const isSub = parentObj && parentObj.subcategories.includes(selected);

        if (!disableOther) {
            if (current.includes(selected)) {
                const newList = current.filter((c) => c !== selected);
                if (isSub && parentObj) {
                    const stillSelected = parentObj.subcategories.some((s) =>
                        newList.includes(s)
                    );
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

        // disableOther === true
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
                    const stillSelected = parentObj.subcategories.some((s) =>
                        newList.includes(s)
                    );
                    if (!stillSelected) {
                        const cleaned = newList.filter((c) => c !== parentObj.title);
                        setCategory(cleaned);
                        return;
                    }
                }
                if (isParent) {
                    const cleaned = newList.filter(
                        (c) => !parentObj.subcategories.includes(c)
                    );
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

        // If trying to pick from a different parent while one is active -> ignore
        return;
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.heading}>Select Categories</Text>

            {data.map((section) => {
                const parentSelected = safeCategory.includes(section.title);
                const isSectionDisabled =
                    disableOther && activeParentKey && activeParentKey !== section.key;

                return (
                    <View key={section.key} style={styles.section}>
                        <TouchableOpacity
                            style={[
                                styles.parentRow
                            ]}
                            onPress={() => toggleExpand(section.key)}
                            activeOpacity={0.8}
                        >

                            <CheckBox
                                checked={parentSelected}
                                disabled={isSectionDisabled}
                                onPress={() => toggleCategory(section.title)}
                                checkedColor="#4c56af"
                                uncheckedColor="#ccc"
                                containerStyle={[
                                    styles.checkboxContainer,
                                    isSectionDisabled && { opacity: 0.4 },
                                ]}
                            />

                            <View style={styles.iconPlaceholder}>{section.icon}</View>
                            <Text
                                style={[
                                    styles.parentTitle,
                                    isSectionDisabled && { color: "#aaa" }, // dim the text
                                ]}
                            >
                                {section.title}
                            </Text>

                            <View style={styles.arrowIcon}>
                                {expanded[section.key] ? <ArrowUpSVG /> : <ArrowDownSVG />}
                            </View>
                        </TouchableOpacity>

                        {expanded[section.key] && (
                            <View style={styles.subList}>
                                {section.subcategories.map((sub, index) => {
                                    const isSelected = safeCategory.includes(sub);
                                    const isDisabled =
                                        disableOther &&
                                        activeParentKey &&
                                        activeParentKey !== section.key;

                                    return (
                                        <CheckBox
                                            key={index}
                                            title={sub}
                                            checked={isSelected}
                                            disabled={isDisabled}
                                            onPress={() => toggleCategory(sub)}
                                            checkedColor="#4c56af"
                                            uncheckedColor="#ccc"
                                            containerStyle={[
                                                styles.subCheckboxContainer,
                                                isDisabled && { opacity: 0.4 },
                                            ]}
                                            textStyle={styles.subText}
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
