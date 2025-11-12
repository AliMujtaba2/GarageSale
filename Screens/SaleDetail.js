import React, { use, useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import ImageView from "react-native-image-viewing";

import LocationPin from "../SVG/locationPin";
import ClockSVG from "../SVG/ClockSVG";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import CategorySVG from "../SVG/CategoriesSVG";
import CartSVG from "../SVG/Cart";
import ArrowupSVG from "../SVG/Arrowup";
import DotSVG from "../SVG/dotsSVG";
import ArrowDown from "../SVG/ArrowDown";
import { FlatList } from "react-native-gesture-handler";
import { Menu, Divider, DefaultTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";
import { Notifier, NotifierComponents } from "react-native-notifier";



const { width } = Dimensions.get("window");
const { height } = Dimensions.get("screen"); // screen height
const maxHeight = height * 0.77;

const SaleDetailsScreen = ({ bottomSheetRef, sale }) => {
  const navigation = useNavigation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // for edit and delete menu
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  //for image viewer
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // for animation
  const snapPoints = useMemo(() => ["17", "50%", "70%"], []);

  // Open Bottom Sheet
  const handleOpenSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(2); // open to 90%
    setIsSheetOpen(true)
  }, []);

  // Close Bottom Sheet
  const handleCloseSheet = () => {
    bottomSheetRef.current?.snapToIndex(0)
    setIsSheetOpen(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // for menu theme
  const whiteTheme = {
    ...DefaultTheme,

  };

  // firebase
  const user = auth.currentUser;
  const deleteSale = async (saleId) => {
    try {
      const saleRef = doc(db, "garageSales", saleId);
      await deleteDoc(saleRef);
      Notifier.showNotification({
        title: "Success",
        description: "Your sale has been deleted.",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "success" },
      });
    } catch (error) {
      console.error("❌ Error deleting sale:", error);
    }
  };

  useEffect(() => {
    if (sale) {
      console.log("✅ Sale received:", sale);
      console.log(" list is open ")
      bottomSheetRef.current?.snapToIndex(1);
      setIsSheetOpen(true);
    }


  }, [sale]);

  if (!sale) {
    console.log("sale not recieved ")
    return null; // prevent crash while sale is not yet selected
  }

  const images = sale.images?.map((uri) => ({ uri })) || [];
  const Separator = () => <View style={styles.separator} />;
  const openImageViewer = (index) => {
    setSelectedIndex(index);
    setViewerVisible(true);
  };
  return (
    <>
      {/* ✅ Bottom Sheet */}
      <BottomSheet

        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        maxDynamicContentSize={maxHeight}
        backgroundStyle={{ backgroundColor: "white" }}
        handleIndicatorStyle={{ backgroundColor: "#3e76caff" }}
        enablePanDownToClose

      >
        <BottomSheetScrollView contentContainerStyle={{ backgroundColor: "#fff" }}>
          {/* Title */}
          <View style={styles.header}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.title}>{sale.title}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  style={{ paddingHorizontal: 10 }}
                  onPress={isSheetOpen ? handleCloseSheet : handleOpenSheet}
                >
                  {isSheetOpen ? <ArrowupSVG /> : <ArrowDown />}
                </TouchableOpacity>
                {(sale.userId === user?.uid || sale.userEmail === user?.email) && (
                  <Menu
                    key={visible ? "open" : "closed"}
                    visible={visible}
                    contentStyle={{ backgroundColor: whiteTheme.colors.surface }}
                    onDismiss={closeMenu}

                    anchor={
                      <TouchableOpacity onPress={openMenu} style={{ padding: 8 }}>
                        <DotSVG width={24} height={24} />
                      </TouchableOpacity>
                    }
                  >
                    <Menu.Item onPress={() => { closeMenu(); navigation.navigate("CreateSale", { post: sale }); }} title="Edit" titleStyle={{ color: whiteTheme.colors.text }} />
                    <Divider />
                    <Menu.Item onPress={() => {
                      closeMenu(); Alert.alert(
                        "Delete Sale",
                        "Are you sure you want to delete this sale?",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: async () => {
                              await deleteSale(sale.id);
                              handleCloseSheet()// Optional: go back after delete
                            },
                          },
                        ]
                      );
                    }} title="Delete" titleStyle={{ color: whiteTheme.colors.text }} />
                  </Menu>)}
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <LocationPin />
              <Text style={styles.infoText}>{sale.address}</Text>
            </View>
          </View>

          {/* Images */}
          <FlatList
            data={sale.images}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageList}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => openImageViewer(index)}>
                <Image source={{ uri: item }} style={styles.image} />
              </TouchableOpacity>
            )}
          />
          <Separator />
          {/* Timing */}
          <View style={styles.timing}>
            <ClockSVG />
            <View style={{ flexDirection: 'column' }}>
              {sale.dateAndTime?.map((slot, index) => {
                const sameDate = slot.rangeStart === slot.rangeEnd;
                const formattedStart = formatDate(slot.rangeStart);
                const formattedEnd = formatDate(slot.rangeEnd);

                return (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderBottomWidth: index !== sale.dateAndTime.length - 1 ? 0.5 : 0,
                      borderColor: '#ccc',
                    }}
                  >
                    <Text style={styles.infoText}>
                      {sameDate ? formattedEnd : `${formattedStart} - ${formattedEnd}`}
                    </Text>

                    <Text style={[styles.infoText, { marginLeft: 20 }]}>
                      {slot.fromTime} - {slot.toTime}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
          <Separator />

          {/* Categories */}
          <View style={styles.infoSection}>
            <View style={{ flexDirection: "row" }}>
              <CategorySVG fill="#547ac2ff" />
              <Text style={styles.infoType}>Category Type: </Text>
              <Text style={styles.infoLabel}> {sale.category?.parent || "Uncategorized"}</Text>
            </View>
            <FlatList
              data={sale.category?.subcategories || []}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => (
                <View style={styles.categoryBox}>
                  <Text style={styles.categoryText}>{item}</Text>
                </View>
              )}
            />
          </View>
          <Separator />
          {/* Items for Sale */}
          <View style={styles.infoSection}>
            <View style={{ flexDirection: "row" }}>
              <CartSVG />
              <Text style={styles.infoLabel}>Items for Sale</Text>
            </View>

            <FlatList
              data={sale.items}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                  ]}
                >
                  <Text style={styles.tableCell}>{item}</Text>
                </View>
              )}
            />
          </View>

        </BottomSheetScrollView>
      </BottomSheet>
      {/* ✅ Full-Screen Image Viewer */}
      <ImageView
        images={images}
        imageIndex={selectedIndex}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />
    </>

  );
};

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderColor: "#eee" },
  title: { fontSize: 22, fontWeight: "700", color: "#222", marginBottom: 6 },

  imageList: { marginVertical: 18, paddingHorizontal: 16, marginRight: 5 },
  image: {
    width: width * 0.7,
    height: 160,
    borderRadius: 10,
    marginRight: 13,
  },

  infoSection: { paddingHorizontal: 10, paddingVertical: 12 },
  infoLabel: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4, marginLeft: 7 },
  infoText: { fontSize: 14, color: "#555", marginBottom: 3, marginLeft: 6, fontWeight: '500' },
  infoType: { fontSize: 13, fontWeight: "500", color: "#333", marginLeft: 15, top: 2 },
  timing: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 10 },

  separator: { height: 2, backgroundColor: "#eee", marginHorizontal: 16 },

  // Items for sale
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f4f9",
    paddingVertical: 2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },

  tableHeaderText: {
    flex: 1,
    fontWeight: "700",
    fontSize: 15,
    color: "#333",
    textAlign: "left",
    paddingHorizontal: 12,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  tableCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: "#222",
    paddingHorizontal: 12,
  },

  rowEven: { backgroundColor: "#fff" },
  rowOdd: { backgroundColor: "#f9fbfd" },



  categoryBox: {
    backgroundColor: "#555", // grey
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2, // for Android shadow
  },
  categoryText: {
    color: "#fff", // white text
    fontWeight: "600",
    fontSize: 14,
  },


});

export default SaleDetailsScreen;
