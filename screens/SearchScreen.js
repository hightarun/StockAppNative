import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  TextInput,
  Text,
  Alert,
  SafeAreaView,
} from "react-native";

import { useStocksContext } from "../contexts/StocksContext";
import { scaleSize } from "../constants/Layout";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";

//Component for auto-complete filtered search
const Searching = (props) => {
  const [text, setText] = useState(""); //state to store the real time search input

  // filters the data matching to the search input and is passed as data to flat list
  const filterdData = text
    ? props.data.filter((item) => {
        const x = text
          .toString()
          .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");
        const regex = new RegExp(`${x}`, "gi");

        return item.symbol.match(regex) || item.name.match(regex);
      })
    : "";

  // Component to make a horizontal seperator line
  const itemSeparator = () => {
    return (
      <View
        style={{
          height: scaleSize(0.8),
          width: "100%",
          backgroundColor: "#666666",
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ backgroundColor: "#121212" }}>
        <View style={styles.searchDescription}>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: scaleSize(10),
              paddingTop: scaleSize(5),
            }}
          >
            Type a company name or stock symbol:
          </Text>
        </View>

        <View style={styles.searchWindow}>
          <Ionicons
            style={{ paddingRight: scaleSize(10) }}
            name="md-search"
            size={scaleSize(20)}
            color="#FFFFFF"
          />
          <TextInput
            style={styles.textInput}
            onChangeText={(t) => setText(t)}
            value={text}
            underlineColorAndroid="transparent"
            placeholder="Search"
          />
        </View>
      </View>

      <SafeAreaView style={styles.list}>
        <FlatList
          windowSize={scaleSize(10)}
          removeClippedSubviews={true}
          data={filterdData}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={itemSeparator}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                props.add(item.symbol); //symbol is passed to addToWatchlist function which was passed as a props in this component
                props.nav.navigate("Stocks"); //it navigates us to the stock screen on press
              }}
            >
              <View style={styles.listContainer}>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <Text style={styles.name}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </View>
  );
};

export default function SearchScreen({ navigation }) {
  const { ServerURL, addToWatchlist } = useStocksContext();
  const [state, setState] = useState({ data: [] }); //data array will store the Json data from the API
  const { data } = state; //object destructring of state

  //function to fetch data from the API
  const fetchAPI = async () => {
    setState({ data: [] });
    try {
      const response = await fetch(`${ServerURL}/all`);
      if (response.ok) {
        const data = await response.json();
        setState({ data });
      } else {
        throw new Error("Network Error");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Network Error", "Please connect to the VPN", [
        { text: "Ok", style: "cancel" },
      ]);
    }
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Searching data={data} add={addToWatchlist} nav={navigation} />
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    flex: 1,
  },

  searchDescription: {
    flexDirection: "row",
    justifyContent: "center",
  },

  list: {
    flex: 1,
    justifyContent: "center",
  },

  searchWindow: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: scaleSize(5),
    padding: scaleSize(8),
    height: scaleSize(40),
    borderWidth: scaleSize(1),
    borderColor: "#121212",
    borderRadius: scaleSize(10),
    backgroundColor: "#1E1E1E",
  },

  textInput: {
    flex: 1,
    color: "#FFFFFF",
  },

  listContainer: {
    paddingBottom: scaleSize(6),
    paddingTop: scaleSize(6),
  },

  symbol: {
    flexDirection: "row",
    textAlign: "left",
    fontSize: scaleSize(16),
    padding: scaleSize(2),
    color: "white",
  },

  name: {
    flexDirection: "row",
    textAlign: "left",
    fontSize: scaleSize(10),
    padding: scaleSize(2),
    color: "white",
  },
});
