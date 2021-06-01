import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useStocksContext } from "../contexts/StocksContext";
import { scaleSize } from "../constants/Layout";

// Component to show the details of the stock when clicked on the particular symbol in watchList
const ShowStockDetails = (props) => {
  return (
    <View>
      <View
        style={{
          justifyContent: "center",
          padding: scaleSize(8),
          flexDirection: "row",
        }}
      >
        <Text style={{ ...styles.stockDetailFont, fontSize: scaleSize(18) }}>
          {props.data.name}
        </Text>
      </View>
      <View style={styles.itemSeperator} />

      <View style={styles.stockRow}>
        <View
          style={{
            width: "50%",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <View>
            <Text style={styles.stockDetailGreyFont}>OPEN</Text>
          </View>

          <View>
            <Text style={styles.stockDetailFont}>{props.data.open}</Text>
          </View>
        </View>

        <View
          style={{
            width: "50%",
            justifyContent: "space-between",
            flexDirection: "row",
            paddingLeft: scaleSize(10),
          }}
        >
          <View>
            <Text style={styles.stockDetailGreyFont}>LOW</Text>
          </View>

          <View>
            <Text style={styles.stockDetailFont}>{props.data.low}</Text>
          </View>
        </View>
      </View>

      <View style={styles.itemSeperator} />

      <View style={styles.stockRow}>
        <View
          style={{
            width: "50%",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <View>
            <Text style={styles.stockDetailGreyFont}>CLOSE</Text>
          </View>

          <View>
            <Text style={styles.stockDetailFont}>{props.data.close}</Text>
          </View>
        </View>
        <View
          style={{
            width: "50%",
            justifyContent: "space-between",
            flexDirection: "row",
            paddingLeft: scaleSize(10),
          }}
        >
          <View>
            <Text style={styles.stockDetailGreyFont}>HIGH</Text>
          </View>
          <View>
            <Text style={styles.stockDetailFont}>{props.data.high}</Text>
          </View>
        </View>
      </View>

      <View style={styles.itemSeperator} />

      <View style={styles.stockRow}>
        <View
          style={{
            flexDirection: "row",
            width: "50%",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.stockDetailGreyFont}>VOLUME</Text>
          <Text style={styles.stockDetailFont}>{props.data.volumes}</Text>
        </View>
      </View>
      <View style={styles.itemSeperator} />
    </View>
  );
};

// Component to render each row in watchlist
const ShowWatchList = (props) => {
  const [symbol, setSymbol] = useState("");
  const [closingPrice, setClosingPrice] = useState("");
  const [openingPrice, setOpeningPrice] = useState("");
  const [percentGain, setPercentGain] = useState("");
  const [bgColor, setBgColor] = useState("black"); //state to change the background color of the active symbol in watchlist
  const [loading, setLoading] = useState(false); //state to check whether the data has been fetched from the server or not

  //function to calculate percentage gain of the stock
  const calcPercentGain = () => {
    const temp = (100 * (closingPrice - openingPrice)) / openingPrice;
    setPercentGain(temp.toFixed(2));
  };

  //function to fetch data from the api
  const fetchApi = async () => {
    try {
      const response = await fetch(`${props.url}/history?symbol=${props.sym}`); //sym has been passed as prop to this component which contains the symbol from the watchlist
      if (response.ok) {
        const data = await response.json();
        setSymbol(data[0].symbol);
        setOpeningPrice(data[0].open);
        setClosingPrice(data[0].close);
        calcPercentGain();
        setLoading(true);
      } else {
        throw new Error("Network Error");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Network Error", "Please connect to VPN", [
        { text: "Ok", style: "cancel" },
      ]);
    }
  };

  //function to change the background color of the active element in list
  const bg = () => {
    //checking if local symbol is equal to the active symbol passed as prop to the component
    if (symbol === props.bgColor) {
      setBgColor("#383838");
    } else {
      setBgColor("black");
    }
  };

  useEffect(() => {
    fetchApi();
    bg();
  });

  return (
    <View>
      {loading === true ? (
        <View>
          <View
            style={{
              ...styles.listContainer,
              backgroundColor: bgColor,
            }}
          >
            <View>
              <Text style={styles.listContent}>{symbol}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.listContent}>{closingPrice}</Text>
            </View>
            {percentGain >= 0 ? (
              <View
                style={{
                  ...styles.percentGainContainer,
                  backgroundColor: "#4CD964",
                }}
              >
                <Text style={styles.listContent}>{percentGain + "%"}</Text>
              </View>
            ) : (
              <View style={styles.percentGainContainer}>
                <Text style={styles.listContent}>{percentGain + "%"}</Text>
              </View>
            )}
          </View>
          <View style={styles.itemSeperator} />
        </View>
      ) : (
        <View style={styles.container}></View>
      )}
    </View>
  );
};

export default function StocksScreen({ route }) {
  const { ServerURL, watchList, deleteFromDisk } = useStocksContext();

  const [state, setState] = useState([]); //this state will be passed to the component which shows the details of the selected stock

  const [symID, setSymID] = useState(""); //state to store the symbol of the active element from the watchlist

  const [activeBg, setActiveBg] = useState("");

  //function to fetch data from the api
  const fetchAPI = async () => {
    try {
      const response = await fetch(`${ServerURL}/history?symbol=${symID}`); //symID has the symbol of the element from the watchlist
      if (response.ok) {
        const data = await response.json();
        setState(data[0]); //setting the data fetched from the active symbol from watchlist to the local state
      } else {
        throw new Error("Network Error");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //function to set the symID state to the active symbol which has been selected from the watchlist and this function also set the
  const stockDataHandler = (sym) => {
    setSymID(sym);
    setActiveBg(sym);
  };

  useEffect(() => {
    // if no element is slected from the watchlist then it will not fetch the data
    if (symID != "") fetchAPI();
  }, [symID]);

  useEffect(() => {
    //if watchlist is empty then the local state will be set empty
    if (watchList.length === 0) {
      setState([]);
    }
  }, [watchList]);

  return (
    <View style={styles.container}>
      {watchList.length != 0 ? (
        <ScrollView>
          {/* Mapping each element(symbol) of watchlist array to fetch data of each element and show it in a list */}
          {watchList.map((sym, index) => {
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.2}
                onLongPress={deleteFromDisk.bind(this, sym)}
                onPress={stockDataHandler.bind(this, sym)}
              >
                <ShowWatchList
                  key={index}
                  url={ServerURL}
                  sym={sym}
                  bgColor={activeBg}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.container}></View>
      )}
      <View style={styles.stockDetailsContainer}>
        <ShowStockDetails data={state} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },

  stockDetailsContainer: {
    flexDirection: "column",
    justifyContent: "flex-end",
    backgroundColor: "#212121",
  },

  stockDetailFont: {
    fontSize: scaleSize(12),
    color: "white",
  },

  stockDetailGreyFont: {
    color: "#707070",
    fontSize: scaleSize(11),
  },

  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: scaleSize(4),
  },

  listContainer: {
    flex: 1,
    flexDirection: "row",
    padding: scaleSize(10),
    justifyContent: "space-between",
    alignItems: "center",
  },

  listContent: {
    fontSize: scaleSize(18),
    color: "#FFFFFF",
    flexDirection: "row",
  },

  priceContainer: {
    flex: 1,
    flexDirection: "row",
    paddingRight: scaleSize(20),
    justifyContent: "flex-end",
  },

  percentGainContainer: {
    paddingRight: scaleSize(5),
    borderRadius: scaleSize(8),
    padding: scaleSize(4),
    backgroundColor: "#FF3830",
    width: "30%",
    alignItems: "flex-end",
  },

  itemSeperator: {
    height: scaleSize(0.6),
    width: "100%",
    backgroundColor: "#D3D3D3",
  },

  loadingText: {
    paddingTop: scaleSize(30),
    flexDirection: "row",
    textAlign: "center",
    fontSize: scaleSize(16),
    color: "white",
  },
  indicator: {
    flex: 1,
    marginVertical: "60%",
    color: "white",
    textAlign: "center",
    justifyContent: "space-between",
  },
});
