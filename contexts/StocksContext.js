import React, { useState, useContext, createContext, useEffect } from "react";
import { AsyncStorage, Alert } from "react-native";

const StocksContext = createContext();

export const StocksProvider = ({ children }) => {
  const [state, setState] = useState([]);

  return (
    <StocksContext.Provider value={[state, setState]}>
      {children}
    </StocksContext.Provider>
  );
};

export const useStocksContext = () => {
  const [state, setState] = useContext(StocksContext);

  //function to load persistant watchlist data from the persistant storage
  async function loadFromDisk() {
    try {
      const dataFromDisk = await AsyncStorage.getItem("stockSym").catch((err) =>
        console.log(err)
      );
      if (dataFromDisk != null) {
        setState(JSON.parse(dataFromDisk));
      }
    } catch {
      Alert.alert("Disk corrupted", "Watchlist not updated", [
        { text: "Ok", style: "cancel" },
      ]);
    }
  }

  //function to delete the symbols from persistent storage as well as local watchlist state
  function deleteFromDisk(watchSymbol) {
    let arr = state.filter((a) => a !== watchSymbol);
    AsyncStorage.setItem("stockSym", JSON.stringify(arr));
    setState(arr);
  }

  //function to add new symbol to the persistant storage as well as the local watchlist state
  function addToWatchlist(newSymbol) {
    //condition to check whether the symbol already exists in the watchlist or not
    if (state.indexOf(newSymbol) === -1) {
      setState([...state, newSymbol]); // adding new symbol to the watchlist state
      AsyncStorage.setItem("stockSym", JSON.stringify([...state, newSymbol])); //adding new symbol to the persistant storage
    } else {
      Alert.alert("Hold up", " It is already on your watchlist", [
        { text: "Ok", style: "cancel" },
      ]);
    }
  }

  useEffect(() => {
    loadFromDisk(); // calling this function to update the local watchlist state from the persistant storage
  }, []);

  return {
    ServerURL: "http://131.181.190.87:3001",
    watchList: state,
    addToWatchlist,
    deleteFromDisk,
  };
};
