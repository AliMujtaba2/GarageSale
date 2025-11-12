import MapboxGL, { UserLocation } from '@rnmapbox/maps';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, FlatList, Keyboard, PermissionsAndroid, TouchableWithoutFeedback, Pressable, AppState, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { LocationContext } from "../Screens/LiveLocationAPI";
// firebase
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";




import Search from '../SVG/Search';
import MapSVG from '../SVG/MapSVG';
import CalenderSVG from '../SVG/calenderSVG';
import CategorySVG from '../SVG/CategoriesSVG';
import LiveLocationSVG from '../SVG/livelocationSVG';
import CreateSaleSVG from '../SVG/CreateSale';
import NewCategoriesSelector from '../Components/NewCategories';

// importing custom components
import RangeCalendar from '../Components/CalenderPicker';
import TimeRangePicker from '../Components/TimePicker';
import CategoriesSelector from "../Components/Categories";
import MyGarageSVG from '../SVG/MyGarageSVG';
import SaleDetailsScreen from './SaleDetail';
import SignOutSVG from '../SVG/SignOut.SVG';
import { Notifier, NotifierComponents } from 'react-native-notifier';





const MapScreen = ({ navigation }) => {

  // fetch sales from firebase
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "garageSales"), (snapshot) => {
      const updatedSales = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("📡 Live sales update:", updatedSales.length);
      setSales(updatedSales);
    });

    // Cleanup when component unmounts
    return () => unsubscribe();
  }, []);



  MapboxGL.setAccessToken('pk.eyJ1IjoibXVqdGFiYTI3MyIsImEiOiJjbWZ0cDB6djUwNHQyMmxzanZ5bzF2Mmp4In0.nvRYhPQI1cJAl_gXnAYEJg');


  // // State for calendar and time and My Garage
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAvailability, setShowAvailability] = useState(false);
  const [selectedMyGarage, setSelectedMyGarage] = useState(false);
  const [sales, setSales] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({
    parent: "",
    subcategories: [],
  });

  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [range, setRange] = useState({ start: null, end: null });
  const [mode, setMode] = useState("single");
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [activeFilters, setActiveFilters] = useState({
    dateRange: null,    // { start: "YYYY-MM-DD", end: "YYYY-MM-DD" } or null
    fromMinutes: null,  // integer minutes from midnight, e.g. 600 for 10:00 AM
    toMinutes: null,    // integer minutes from midnight
    categories: [],     // array of selected category strings
    myGarageOnly: false,
  });
  const minutesFromDate = (d) => {
    if (!d) return null;
    return d.getHours() * 60 + d.getMinutes();
  };
  
  const { height } = Dimensions.get("screen"); // screen height
  const maxHeight = height * 0.77;

  //filter function
  const parseTimeStringToMinutes = (tStr) => {
    if (!tStr) return null;
    const parts = tStr.trim().split(' ');
    if (parts.length < 2) return null;
    const time = parts[0];
    const modifier = parts[1].toUpperCase();
    const [hStr, mStr] = time.split(':');
    let hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr || '0', 10);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const filteredSales = sales.filter((sale) => {
    const { dateRange, fromMinutes, toMinutes, categories, myGarageOnly } = activeFilters;

    // 1) Category filter
    const matchesCategory =
      !categories?.length ||
      (
        sale.category &&
        (
          categories.includes(sale.category.parent) ||
          sale.category.subcategories?.some(sub => categories.includes(sub))
        )
      );



    // 2) My Garage filter
    const matchesMyGarage = !myGarageOnly || sale.userId === user?.uid;

    // 3) Date filter (supports single date when start === end)
    let matchesDate = true;
    if (dateRange?.start && sale.dateAndTime?.length > 0) {
      const saleDate = sale.dateAndTime[0];
      const saleStart = new Date(saleDate.rangeStart);
      const saleEnd = new Date(saleDate.rangeEnd);

      const filterStart = new Date(dateRange.start);
      const filterEnd = dateRange.end ? new Date(dateRange.end) : filterStart;

      matchesDate = saleEnd >= filterStart && saleStart <= filterEnd;
    }

    // 4) Time filter using minutes (if active)
    let matchesTime = true;
    // Only run time logic if either filter minutes are set AND sale has date/time slots
    if ((fromMinutes !== null || toMinutes !== null) && sale.dateAndTime?.length > 0) {
      const saleTime = sale.dateAndTime[0];
      const slotFromMin = parseTimeStringToMinutes(saleTime.fromTime);
      const slotToMin = parseTimeStringToMinutes(saleTime.toTime);

      // If sale has no times, treat it as matching
      if (slotFromMin == null || slotToMin == null) {
        matchesTime = true;
      } else {
        const fFrom = fromMinutes !== null ? fromMinutes : 0;
        const fTo = toMinutes !== null ? toMinutes : 24 * 60 - 1;
        matchesTime = slotToMin >= fFrom && slotFromMin <= fTo;
      }
    }

    return matchesCategory && matchesMyGarage && matchesDate && matchesTime;
  });



  // state for search locations

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]); // Mapbox features
  const [selectedLocation, setSelectedLocation] = useState([74.3587, 31.5204]); // Lahore by default
  const [isSearching, setIsSearching] = useState(false);
  const cameraRef = useRef(null);

  // state for live location
  const [userCoords, setUserCoords] = useState(null);
  // state for Context API
  const { setLiveCoords } = useContext(LocationContext);
  // check app state to refresh location when app comes to foreground
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        console.log("🔄 App resumed, checking location status...");
        checkIfLocationEnabled(); // custom function we’ll add below
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  const checkIfLocationEnabled = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords([longitude, latitude]);
      },
      (error) => {
        if (error.code === 2) {
          Notifier.showNotification({
            title: "GPS Off",
            description: "Please enable your device GPS to use live location.",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "warn" },
          });
        } else {
          console.log("⚠️ Location error:", error);
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };




  // function for searching location in maps
  const searchLocation = async (text) => {
    if (!text || text.trim() === '') {
      setSuggestions([]);
      return;
    }
    try {
      setIsSearching(true);
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=pk.eyJ1IjoibXVqdGFiYTI3MyIsImEiOiJjbWZ0cDB6djUwNHQyMmxzanZ5bzF2Mmp4In0.nvRYhPQI1cJAl_gXnAYEJg&autocomplete=true&limit=6`;
      const res = await fetch(url);
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (err) {
      console.warn('Search error', err);
    } finally {
      setIsSearching(false);
    }
  };


  const handleSelectPlace = (feature) => {
    Keyboard.dismiss();
    setSuggestions([]);
    if (!feature) return;
    const coords = feature.center || (feature.geometry && feature.geometry.coordinates);
    if (!coords) return;
    setQuery(feature.place_name);
    setSelectedLocation(coords);
    cameraRef.current?.setCamera({
      centerCoordinate: coords,
      zoomLevel: 14,
      animationDuration: 1000,
    });
  };

  // optional: call search when user presses Search button / Enter
  const onSubmitSearch = () => {
    searchLocation(query);
  };

  async function requestLocationPermission() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need access to your location to show it on the map',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ Location permission granted');
      } else {
        console.log('❌ Location permission denied');
      }
    }
  }

  useEffect(() => {
    requestLocationPermission();
    // console.log("Filtered Categories"+ matchesCategory);
  }, []);


  const getLiveLocation = async () => {
    if (userCoords) {
      cameraRef.current?.setCamera({
        centerCoordinate: userCoords,
        zoomLevel: 14,
        animationDuration: 1000,
      });
      setSelectedLocation(userCoords);
    } else {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (!granted) {
          // 👇 Request permission if not granted
          await requestLocationPermission();
        } else {
          // 👇 Already granted but GPS might be off
          Notifier.showNotification({
            title: "GPS Off",
            description: "Please turn on your device GPS to use live location.",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "warn" },
          });
        }
      } catch (err) {
        console.error("⚠️ Error checking location permission:", err);
      }
    }
  };
  // for Categories Bottom Sheet
  const categoriesSheetRef = useRef(null);


  // for animation (bottom sheet for Sale Detail)
  const bottomSheetRef = useRef(null);

  const [selectedSale, setSelectedSale] = useState(null);


  const handleMarkerPress = (sale) => {
    console.log("pin is tapped");
    setSelectedSale(sale);
    bottomSheetRef.current?.expand();
  };

  // handle SIgnup

  const handleSignup = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login"); // navigate to login screen after signout
    } catch (error) {
      console.error(error);
      alert("Error signing out: " + error.message);
    }

  };

  return (

    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MapSVG />
        <TextInput
          style={styles.searchInput}
          placeholder="Search location here"
          placeholderTextColor="#888"
          onChangeText={(t) => {
            setQuery(t);
            searchLocation(t); // show suggestions as user types
          }}
          onSubmitEditing={onSubmitSearch}
        />
        <TouchableOpacity onPress={() => searchLocation(query)}>
          <Search />
        </TouchableOpacity>

        <View style={{ marginLeft: 10, alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity onPress={handleSignup}>
            <SignOutSVG />
            <Text style={{ fontSize: 10 }}>Sign Out</Text>
          </TouchableOpacity></View>

      </View>

      {/* search suggestions overlay */}
      {suggestions.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectPlace(item)}
              >
                <Text style={styles.resultText}>{item.place_name}</Text>
                <Text style={styles.resultSubText}>
                  {item.place_type && item.place_type[0]} • {item.context ? item.context.map(c => c.text).slice(0, 2).join(', ') : ''}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}


      {/* filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowAvailability(!showAvailability)}>
          <CalenderSVG />
          <Text style={styles.filterText}>Availability</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => {
            categoriesSheetRef.current?.expand();
          }}
        >
          <CategorySVG />
          <Text style={styles.filterText}>Categories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterBtn,
            selectedMyGarage && { backgroundColor: "#413939ff" }
          ]}
          onPress={() => {
            const next = !selectedMyGarage;
            setSelectedMyGarage(next);
            setActiveFilters(prev => ({ ...prev, myGarageOnly: next }));
          }}
        >
          <MyGarageSVG fill={selectedMyGarage ? "#fff" : "#000"} />
          <Text style={[styles.filterText, selectedMyGarage && { color: "#fff" }]}>
            My Garage
          </Text>
        </TouchableOpacity>
      </View>

      {showAvailability && (
        <View style={styles.availabilityContainer}>
          {/* 📅 Date Picker */}
          <RangeCalendar range={range} setRange={setRange} setMode={setMode} />

          {/* ⏰ Time Picker */}
          <TimeRangePicker
            fromTime={fromTime}
            toTime={toTime}
            setFromTime={setFromTime}
            setToTime={setToTime}
          />

          {/* 💾 Save Button */}
          <View style={styles.saveBtnContainer}>
            {/* Save Button */}
            {/* Underlined Cancel Text */}
            <TouchableOpacity
              onPress={() => {
                setRange({ start: null, end: null });
                setFromTime(null);
                setToTime(null);
                setActiveFilters((prev) => ({
                  ...prev,
                  dateRange: null,
                  fromMinutes: null,
                  toMinutes: null,
                }));
                setShowAvailability(false);
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              activeOpacity={0.8}
              onPress={() => {
                const dateRange = range.start
                  ? { start: range.start, end: range.end || range.start }
                  : null;

                const fromM = minutesFromDate(fromTime);
                const toM = minutesFromDate(toTime);

                setActiveFilters((prev) => ({
                  ...prev,
                  dateRange,
                  fromMinutes: fromM,
                  toMinutes: toM,
                }));

                setShowAvailability(false);
              }}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}






      <MapboxGL.MapView
        style={styles.map}
        compassEnabled={false}   // Remove compass
        scaleBarEnabled={false}  // Remove scale/distance meter
        logoEnabled={false}      // Remove Mapbox logo
        attributionEnabled={false}
      >


        {filteredSales.map((sale, index) => {
          if (!sale.location?.latitude || !sale.location?.longitude) return null;

          const coords = [sale.location.longitude, sale.location.latitude];
          const annotationId = String(sale.id);

          return (
            <MapboxGL.PointAnnotation
              key={sale.id}
              id={annotationId}
              coordinate={coords}
              onSelected={() => handleMarkerPress(sale)}
            >
              <View style={styles.markerContainer}>
                <View style={styles.marker} />
              </View>
            </MapboxGL.PointAnnotation>
          );
        })}


        <MapboxGL.Camera
          zoomLevel={12}
          centerCoordinate={selectedLocation}
          animationMode="flyTo"
          animationDuration={1000}
        />

        <UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
          onUpdate={(location) => {
            if (location && location.coords) {
              const coords = [location.coords.longitude, location.coords.latitude];
              setUserCoords(coords);
              setLiveCoords({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              });
              console.log('📍 Updated user location:', coords);
            }
          }}
        />
      </MapboxGL.MapView>

      <View style={styles.fabContainer}>
        {/* Live Location Button */}
        <TouchableOpacity style={styles.liveButton} onPress={getLiveLocation}>
          <LiveLocationSVG />
        </TouchableOpacity>

        {/* Create Sale Button */}
        <TouchableOpacity style={styles.saleButton} onPress={() => navigation.navigate("CreateSale")}>
          <CreateSaleSVG />
        </TouchableOpacity>
      </View>
      {/* ✅ Importing BottomSheet Component */}
      <SaleDetailsScreen bottomSheetRef={bottomSheetRef} sale={selectedSale} />

      <BottomSheet
        ref={categoriesSheetRef}
        snapPoints={["60%", "80%"]}
        enablePanDownToClose={true}
        index={-1} // initially closed
        backgroundStyle={{ backgroundColor: "#fff" }}
        maxDynamicContentSize={maxHeight}
        style={{ zIndex: 100 }} // 👈 important
        onChange={(index) => {
          if (index >= 0) {
            // Hide any other overlays when bottom sheet is visible
            setShowAvailability(false);
            setSuggestions([]);
          }
        }}
      >
        <BottomSheetScrollView style={{ flex: 1, padding: 10 }}>
          <NewCategoriesSelector
            category={selectedCategories}
            setCategory={(cats) => {
              setSelectedCategories(cats);
              setActiveFilters(prev => ({
                ...prev,
                categories: [cats.parent, ...(cats.subcategories || [])].filter(Boolean),
              }));
            }}
          />
        </BottomSheetScrollView>
      </BottomSheet>




      {/* {(showAvailability  || suggestions.length > 0) && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            setShowAvailability(false);
            // setShowCategories(false);
            setSuggestions([]);
            Keyboard.dismiss();
          }}
        />
      )} */}


    </View>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchContainer: {
    position: "absolute", // float above the map
    top: 19,
    left: 19,
    right: 19,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 52,
    paddingHorizontal: 15,
    height: 50,
    elevation: 25, // for Android shadow
    zIndex: 10,   // ensure it’s on top
  },

  searchInput: {
    flex: 1,
    fontSize: 17,
    marginHorizontal: 10,
    color: "#333",
    paddingVertical: 0,
    fontWeight: '500',
  },

  filterContainer: {
    position: "absolute",
    top: 80, // below search bar
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 5,
    zIndex: 15,
  },

  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 8,
    elevation: 10,
  },

  filterText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  availabilityContainer: {
    position: "absolute",
    top: 120, // below filter buttons
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    height: 500,
    borderRadius: 12,
    padding: 10,
    elevation: 15,
    zIndex: 20,
  },
  saveBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 20,
    width: 110,
    height: 55,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  saveBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // ⬅️ pushes both to the right
    alignItems: 'center',
    gap: 15, // ⬅️ space between Cancel and Save
  },
  cancelText: {
    color: "#413939",
    textDecorationLine: "underline",
    fontSize: 15,
    fontWeight: "500",
  },
  categoriesContainer: {
    position: "absolute",
    top: 110, // same as availability container
    left: 10,
    right: 10,
    elevation: 15,
    zIndex: 20,
  },

  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 12, // adds space between buttons
  },

  liveButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    height: 60,
    width: 60,
    padding: 14,
    borderRadius: 50,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },

  saleButton: {
    backgroundColor: "#6C63FF", // purple
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  //search suggestion
  resultsContainer: {
    position: "absolute",
    top: 70,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 10,
    zIndex: 50,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultText: {
    fontSize: 14,
    color: "#333",
  },




});

export default MapScreen;
