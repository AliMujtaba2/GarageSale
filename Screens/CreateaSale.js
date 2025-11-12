import React, { useState, useEffect, useContext } from "react";
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { TextInput, Button, Chip, Divider, Appbar, ActivityIndicator } from "react-native-paper";
import { launchImageLibrary } from "react-native-image-picker";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { LocationContext } from "../Screens/LiveLocationAPI";
// firebase database
import { auth, db } from "../firebase";

import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { PermissionsAndroid, Platform } from "react-native";

//importing SVGS
import ImageSVG from "../SVG/images";
import CategoriesSelector from "../Components/Categories";
import RangeCalendar from "../Components/CalenderPicker";
import TimeRangePicker from "../Components/TimePicker";
import LocationPin from "../SVG/locationPin";
import { BottomSheet } from "@rneui/themed";
import NewCategoriesSelector from "../Components/NewCategories";



export default function CreatePostScreen({ navigation, route }) {

    // set state for data form for new post
    const [title, setTitle] = useState("");
    const [address, setAddress] = useState("");
    const [category, setCategory] = useState({ parent: "", subcategories: [] });
    const [chips, setChips] = useState([]);
    const [chipText, setChipText] = useState("");
    const [dates, setDates] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    const [imageLoading, setImageLoading] = useState(false);

    const [range, setRange] = useState({ start: null, end: null });
    const [fromTime, setFromTime] = useState(new Date());
    const [toTime, setToTime] = useState(new Date());
    const [mode, setMode] = useState("single");

    const isCreatePost = true;

    //set State for edit post
    useEffect(() => {
        if (isEdit && existingPost) {
            setTitle(existingPost.title || "");
            setAddress(existingPost.address || "");
            setCategory(existingPost.category || []);
            setChips(existingPost.items || []);
            setImageUrls(existingPost.images || []); // 🔥 You used "imageUrls" but your Firestore save uses "images"

            // ✅ Fix: load time/date chips
            if (existingPost.dateAndTime && existingPost.dateAndTime.length > 0) {
                const formattedDates = existingPost.dateAndTime.map(d => {
                    if (d.rangeStart && d.rangeEnd) {
                        return `${d.rangeStart} → ${d.rangeEnd} | ${d.fromTime} to ${d.toTime}`;
                    }
                    return `${d.rangeStart || ""} | ${d.fromTime || ""} to ${d.toTime || ""}`;
                });
                setDates(formattedDates);
            }

            setSelectedAddress(existingPost.address || "");
            if (existingPost.location) {
                setSelectedLocation(existingPost.location); // ✅ actual coordinates
                fetchAddress(existingPost.location);        // ✅ get readable address (don’t assign its return)
            }
        }
    }, [isEdit, existingPost]);


    // set state for bottomsheets (asking user for location input)
    const [isVisible, setIsVisible] = useState(false);
    //get Live Location From Context API
    const { liveCoords } = useContext(LocationContext);


    // firestore collection function

    const handleSubmit = async () => {
        const user = auth.currentUser;

        if (!user) {
            Notifier.showNotification({
                title: "Error",
                description: "Please login before posting.",
                Component: NotifierComponents.Alert,
                componentProps: { alertType: "error" },
            });
            return;
        }

        // ✅ Validate required fields
        if (
            !title.trim() ||
            !address.trim() ||
            !category ||
            category.length === 0 ||
            dates.length === 0 ||
            !selectedLocation
        ) {
            Notifier.showNotification({
                title: "Info",
                description: "Please fill all the required fields.",
                Component: NotifierComponents.Alert,
                componentProps: { alertType: "info" },
            });
            return;
        }

        // ✅ Convert `dates` (which is a list of formatted strings) into structured objects
        const structuredDates = dates.map((entry) => {
            // Example string: "2025-10-09 → 2025-10-11 | 09:00 AM to 06:00 PM"
            const [rangePart, timePart] = entry.split(" | ");
            let rangeStart = null,
                rangeEnd = null,
                fromTime = null,
                toTime = null;

            if (rangePart.includes("→")) {
                const [start, end] = rangePart.split("→").map((s) => s.trim());
                rangeStart = start;
                rangeEnd = end;
            } else {
                rangeStart = rangePart.trim();
                rangeEnd = rangePart.trim();
            }

            if (timePart) {
                const [from, to] = timePart.split("to").map((s) => s.trim());
                fromTime = from;
                toTime = to;
            }

            return { rangeStart, rangeEnd, fromTime, toTime };
        });

        const saleData = {
            title,
            address,
            category: {
                parent: category?.parent ?? "",
                subcategories: category?.subcategories ?? [],
            },
            items: chips,
            images: imageUrls,
            location: {
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
            },
            dateAndTime: structuredDates,
            userId: user.uid,
            userEmail: user.email,
            createdAt: new Date(),
            updatedAt: new Date(),
        };


        try {
            if (isEdit && existingPost?.id) {
                // ✏️ Update existing post
                const docRef = doc(db, "garageSales", existingPost.id);
                await updateDoc(docRef, saleData);
                Notifier.showNotification({
                    title: "Success",
                    description: "Your Garage Sale has been updated!",
                    Component: NotifierComponents.Alert,
                    componentProps: { alertType: "success" },
                });
            } else {
                // 🆕 Create new post
                console.log("🧩 Final saleData:", saleData);
                await addDoc(collection(db, "garageSales"), saleData);
                Notifier.showNotification({
                    title: "Success",
                    description: "Your Garage Sale is posted successfully!",
                    Component: NotifierComponents.Alert,
                    componentProps: { alertType: "success" },
                });
            }

            // ✅ Reset form after submission
            setTitle("");
            setAddress("");
            setCategory({ parent: "", subcategories: [] });
            setChips([]);
            setDates([]);
            setImageUrls([]);
            setSelectedLocation(null);
            setSelectedAddress("");

        } catch (error) {
            console.error("❌ Error saving sale:", error);
            Notifier.showNotification({
                title: "Error",
                description: "Failed to save Garage Sale.",
                Component: NotifierComponents.Alert,
                componentProps: { alertType: "error" },
            });
        }
    };

    ///////////////

    console.log("getting location from context api " + liveCoords);


    const isEdit = route.params?.post ? true : false;
    const existingPost = route.params?.post || {};





    const defaultCoords = { latitude: 39.8283, longitude: -98.5795 };
    const [selectedLocation, setSelectedLocation] = useState(defaultCoords);
    const [selectedAddress, setSelectedAddress] = useState(""); // readable name



    async function requestLocationPermission() {
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Permission",
                    message: "Garage Sale needs access to your location.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK",
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true; // iOS handles via Info.plist
    }

    // get readable user addres
    useEffect(() => {
        if (route.params?.pickedLocation) {
            const [longitude, latitude] = route.params.pickedLocation;
            const coords = { latitude, longitude };
            setSelectedLocation(coords);  // always update selected
            fetchAddress(coords);
        }
    }, [route.params?.pickedLocation]);


    const fetchAddress = async ({ latitude, longitude }) => {
        try {
            const token = "pk.eyJ1IjoibXVqdGFiYTI3MyIsImEiOiJjbWZ0cDB6djUwNHQyMmxzanZ5bzF2Mmp4In0.nvRYhPQI1cJAl_gXnAYEJg";
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}`
            );
            const data = await res.json();
            if (data.features && data.features.length > 0) {
                setSelectedAddress(data.features[0].place_name);
                Notifier.showNotification({
                    title: "Success",
                    description: "Location is saved",
                    Component: NotifierComponents.Alert,
                    componentProps: {
                        alertType: "success", // "error" | "info" | "warn"
                    },
                });
            } else {
                setSelectedAddress("Unknown location");
            }
        } catch (err) {
            setSelectedAddress("Unknown location");
            Notifier.showNotification({
                title: "Error",
                description: "Error Fetching Address , Try Again...",
                Component: NotifierComponents.Alert,
                componentProps: {
                    alertType: "error", // "error" | "info" | "warn"
                },
            });
        }
    };

    const getLiveLocation = async () => {
        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            Notifier.showNotification({
                title: "Permission Needed",
                description: "Please grant location permission to continue.",
                Component: NotifierComponents.Alert,
                componentProps: { alertType: "warn" },
            });
            return;
        }
        if (!liveCoords) {
            Notifier.showNotification({
                title: "GPS Disabled",
                description: "Please enable GPS and try again.",
                Component: NotifierComponents.Alert,
                componentProps: { alertType: "warn" },
            });
            return;
        }
        const coords = { latitude: liveCoords.latitude, longitude: liveCoords.longitude };
        setSelectedLocation(coords);   // using live coords
        fetchAddress(coords);
        console.log("checking ", coords)

        Notifier.showNotification({
            title: "Success",
            description: "Location is saved",
            Component: NotifierComponents.Alert,
            componentProps: {
                alertType: "Success", // "error" | "info" | "warn"
            },
        });

    };


    // 📷 pick multiple images
    const handleImagePick = async () => {
        try {
            const result = await launchImageLibrary({ mediaType: "photo", selectionLimit: 5 });

            if (!result.assets || result.assets.length === 0) return;

            // Show loading if needed
            setImageLoading(true);

            const uploadedUrls = [];

            for (const image of result.assets) {
                const data = new FormData();
                data.append("file", {
                    uri: image.uri,
                    type: image.type || "image/jpeg",
                    name: image.fileName || `photo_${Date.now()}.jpg`,
                });
                data.append("upload_preset", "my_preset"); // replace with your unsigned preset

                const res = await fetch("https://api.cloudinary.com/v1_1/dzmuajz2g/image/upload", {
                    method: "POST",
                    body: data,
                });

                const json = await res.json();

                if (json.secure_url) {
                    uploadedUrls.push(json.secure_url);
                    console.log("✅ Uploaded:", json.secure_url);
                } else {
                    console.warn("⚠️ Failed to upload:", image.uri);
                }
            }

            // Merge with existing
            setImageUrls((prev) => [...prev, ...uploadedUrls]);
            console.log("🖼️ All uploaded URLs:", uploadedUrls);

        } catch (err) {
            console.error("❌ Upload failed:", err);
        } finally {
            setImageLoading(false);
        }
    };


    // ❌ remove specific image
    const removeImage = (uri) => {
        setImageUrls(imageUrls.filter((img) => img !== uri));
        console.log(" image are:", imageUrls)
    };

    const toggleBottomSheet = () => {
        setIsVisible(!isVisible);
    };



    const addChip = () => {
        if (chipText.trim()) {
            setChips([...chips, chipText.trim()]);
            setChipText("");
        }
    };



    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
            <Appbar.Header style={{ backgroundColor: "#ffffffff" }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} color="black" />
                <Appbar.Content title={isEdit ? "Edit Post" : "Create Post"} titleStyle={{ color: "black", fontWeight: "600" }} />
            </Appbar.Header>
            <View style={{ padding: 20 }}>

                {/* Upload Container */}
                <TouchableOpacity style={styles.uploadContainer} onPress={handleImagePick}>
                    <View style={styles.dottedBox}>
                        <ImageSVG />
                        <Text style={styles.uploadText}>Upload your Images</Text>
                    </View>
                </TouchableOpacity>


                {imageLoading && (
                    <View style={{ marginVertical: 15, alignItems: "center" }}>
                        <ActivityIndicator size="large" color="#4CAF50" />
                        <Text style={{ marginTop: 8, color: "#555" }}>Uploading images...</Text>
                    </View>
                )}


                <View style={styles.imagePreviewContainer}>
                    {/* ✅ Show selected images */}
                    <View style={styles.imagePreviewContainer}>
                        {imageUrls.map((uri, index) => (
                            <View key={index} style={styles.imageBox}>
                                <Image source={{ uri }} style={styles.imageThumb} />
                                <TouchableOpacity
                                    style={styles.removeIcon}
                                    onPress={() => removeImage(uri)}
                                >
                                    <Text style={styles.removeText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>


                {/* Title */}
                < TextInput
                    label="Title"
                    value={title}
                    onChangeText={setTitle}
                    mode="outlined"

                    style={styles.input}
                    textColor="#1E293B"
                    outlineColor="#E2E8F0"
                    activeOutlineColor="#6366F1"
                    placeholder="Enter post title"
                />

                {/* Address */}
                < TextInput
                    label="Address"
                    value={address}
                    onChangeText={setAddress}
                    mode="outlined"
                    style={{ marginBottom: 16, borderRadius: 12 }}
                    textColor="#1E293B"
                    outlineColor="#E2E8F0"
                    activeOutlineColor="#6366F1"
                    placeholder="Enter location"
                />

                {/* Location (fake input) */}
                <TouchableOpacity
                    style={styles.fakeInput}
                    onPress={toggleBottomSheet}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <LocationPin />
                        <Text
                            style={styles.fakeInputText}
                        >
                            {selectedAddress || "Select Location"}
                        </Text>
                    </View>
                </TouchableOpacity>


                {/* BottomSheet to ask user to choose location */}
                <BottomSheet isVisible={isVisible}>
                    <View style={styles.sheetContainer}>
                        <Text style={styles.sheetTitle}>Select Location Option</Text>

                        <TouchableOpacity
                            style={styles.sheetOption}
                            onPress={() => {
                                setIsVisible(false);
                                getLiveLocation();
                            }}
                        >
                            <Text style={styles.sheetOptionText}>Use Live Location</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sheetOption}
                            onPress={() => {
                                setIsVisible(false);
                                //getLiveLocation();
                                if (selectedLocation) {
                                    navigation.navigate("MapPicker", {
                                        LiveLocation: [
                                            selectedLocation.longitude,
                                            selectedLocation.latitude,
                                        ],
                                        onPick: (coords) => {
                                            setSelectedLocation({
                                                latitude: coords[1],
                                                longitude: coords[0],
                                            });
                                            fetchAddress({
                                                latitude: coords[1],
                                                longitude: coords[0],
                                            });
                                        },
                                    });
                                }
                                else {
                                    Notifier.showNotification({
                                        title: "Error",
                                        description:
                                            "Please grant permission and enable your device location.",
                                        Component: NotifierComponents.Alert,
                                        componentProps: {
                                            alertType: "error",
                                        },
                                    });
                                }
                            }}
                        >
                            <Text style={styles.sheetOptionText}>Pick on Map</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sheetOption, { backgroundColor: "#f3f4f6" }]}
                            onPress={() => setIsVisible(false)}
                        >
                            <Text style={[styles.sheetOptionText, { color: "red" }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheet>



                {/* Category */}
                <View style={styles.category}>
                    <NewCategoriesSelector
                        category={category}
                        setCategory={setCategory}
                        disableOther={isCreatePost}
                    />

                </View>



                {/* Add Items */}
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
                    <TextInput
                        value={chipText}
                        onChangeText={setChipText}
                        mode="outlined"
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                        textColor="#1E293B"
                        outlineColor="#E2E8F0"
                        activeOutlineColor="#6366F1"
                        placeholder="Enter Items.."
                    ></TextInput>
                    <Button
                        mode="contained"
                        onPress={addChip}
                        style={styles.addBtn}
                        labelStyle={{ color: "white" }}
                    >
                        Add
                    </Button >
                </View>

                {/* Chips */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
                    {chips.map((chip, index) => (
                        <Chip
                            key={index}
                            style={{ margin: 4, backgroundColor: "#EEF2FF" }}
                            textStyle={{ color: "#4338CA" }}
                            onClose={() => setChips(chips.filter((_, i) => i !== index))}
                        >
                            {chip}
                        </Chip>
                    ))}
                </View>

                {/* Date & Time Picker */}
                <TouchableOpacity style={styles.fakeInput} onPress={() => setShowPicker(true)}>
                    <Text style={styles.fakeInputText}>Tap to Select Date & Time</Text>
                </TouchableOpacity>
                {
                    showPicker && (
                        <View style={styles.overlay}>
                            <View style={styles.popup}>
                                <RangeCalendar range={range} setRange={setRange} setMode={setMode} />
                                <TimeRangePicker
                                    fromTime={fromTime}
                                    toTime={toTime}
                                    setFromTime={setFromTime}
                                    setToTime={setToTime}
                                />

                                {/* Buttons */}
                                <View style={styles.popupActions}>
                                    <Button
                                        mode="text"
                                        onPress={() => setShowPicker(false)}
                                        labelStyle={{ color: "#64748B" }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        mode="contained"
                                        onPress={() => {

                                            console.log("Entering Range");
                                            if (range.start && range.end) {
                                                // Range Mode

                                                setMode("range");
                                                const formatted = `${range.start} → ${range.end} | ${fromTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} to ${toTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                                                setDates([...dates, formatted]);
                                                setShowPicker(false);

                                            } else if (range.start && !range.end) {
                                                // Single Mode
                                                setMode("single");
                                                console.log("in Range");
                                                const singleDate = range.start;
                                                const formatted = `${singleDate} | ${fromTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} to ${toTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                                                console.log("Time is " + fromTime);
                                                const formattedTime = fromTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                                                console.log("Formatted Time is " + fromTime.getTime());
                                                // Normalize end date
                                                const normalizedRange = { start: singleDate, end: singleDate };

                                                setRange(normalizedRange);
                                                setDates([...dates, formatted]);
                                                setShowPicker(false);


                                            } else {
                                                // Nothing selected
                                                Notifier.showNotification({
                                                    title: "Select Date",
                                                    description: "Please select at least one date.",
                                                    Component: NotifierComponents.Alert,
                                                    componentProps: { alertType: "warn" }
                                                });
                                            }
                                        }}
                                        style={styles.confirmBtn}
                                        labelStyle={{ color: "white" }}
                                    >
                                        Add
                                    </Button>
                                </View>
                            </View>
                        </View>
                    )
                }

                {/* Date Chips */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
                    {dates.map((date, index) => (
                        <Chip
                            key={index}
                            style={{ margin: 4, backgroundColor: "#ECFDF5" }}
                            textStyle={{ color: "#059669" }}
                            onClose={() => setDates(dates.filter((_, i) => i !== index))}
                        >
                            {date}
                        </Chip>
                    ))}
                </View>

                <Divider style={{ marginVertical: 20, backgroundColor: "#E2E8F0", height: 1 }} />

                {/* Submit */}
                <Button
                    mode="contained"
                    style={[styles.submitBtn, imageLoading && { opacity: 0.6 }]}
                    labelStyle={{ color: "white", fontSize: 16, fontWeight: "600" }}
                    onPress={() => {
                        if (!imageLoading) handleSubmit();
                    }}
                    disabled={imageLoading}
                >
                    {imageLoading ? "Uploading Images..." : isEdit ? "Update Post" : "Submit Post"}
                </Button>
            </View >
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    input: {
        marginBottom: 16,
        borderRadius: 12,

    },
    uploadContainer: {
        marginBottom: 20,
        alignItems: "center",
    },
    dottedBox: {
        borderWidth: 2,
        borderColor: "#000000ff", // Divider color
        borderStyle: "solid",
        borderRadius: 10,
        width: "100%",
        height: 150,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB", // Surface
        overflow: "hidden",
    },
    uploadText: {
        fontSize: 16,
        color: "#6B7280", // Secondary Text
        marginTop: 6,
    },
    fakeInput: {
        flexDirection: 'row',
        borderWidth: 2.5,
        borderColor: "#E5E7EB", // Divider
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        marginBottom: 16,
        backgroundColor: "#fdfdfdff", // Surface
    },
    fakeInputText: {
        marginHorizontal: 10,
        fontSize: 16,
        color: "#6B7280", // Text Secondary
    },
    addBtn: {
        backgroundColor: "#2563EB", // Primary
        borderRadius: 8,
    },
    submitBtn: {
        backgroundColor: "#2563EB", // Primary
        borderRadius: 10,
        paddingVertical: 6,
    },
    confirmBtn: {
        backgroundColor: "#10B981", // Secondary (Green confirm)
        marginLeft: 8,
        borderRadius: 8,
    },
    popup: {
        position: "absolute",
        top: "30%",
        left: "5%",
        right: "5%",
        backgroundColor: "#FFFFFF", // Surface
        borderRadius: 12,
        padding: 16,
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    popupActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 12,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(17,24,39,0.4)", // softer dark overlay
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },
    // for bottom sheet
    sheetContainer: {
        backgroundColor: "white",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
        //   alignItems:'center',
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 12,
        textAlign: "center",
    },
    sheetOption: {
        // flexDirection: 'row',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    sheetOptionText: {
        fontSize: 16,
        color: "#1F2937",
        textAlign: "center",
    },

    // view selected images

    imagePreviewContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 16,
    },

    imageBox: {
        position: "relative",
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 10,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    imageThumb: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },

    removeIcon: {
        position: "absolute",
        top: 2,
        right: 2,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 10,
        paddingHorizontal: 4,
    },

    removeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    category: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 5,
        marginVertical: 10,

        // Shadow for iOS
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        // Elevation for Android
        elevation: 6,

    }

});

