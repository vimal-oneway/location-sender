import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeys } from "./types/storageKeys";
import * as WebBrowser from "expo-web-browser";

export default function App() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [changePhoneNumber, setChangePhoneNumber] = useState(false);
  const [link, setLink] = useState("");

  const validateNumber = (value: string) => {
    if (value.length < 10) {
      setError("Phone number is required");
      return false;
    } else if (value.length > 10) {
      setError("Phone number is invalid");
      return false;
    } else setError("");
    return true;
  };

  const textChangeHandler = (e: string) => {
    setValue(e);
    validateNumber(e);
  };

  const handleSubmit = async () => {
    if (!validateNumber(value)) return;
    await AsyncStorage.setItem(StorageKeys.PHONE_NUMBER, value);
    setChangePhoneNumber(false);
    setPhoneNumber(value);
  };

  const handleSendLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const gmapUrl = `https://maps.google.com/maps?z=12&t=m&q=loc:${location.coords.latitude}+${location.coords.longitude}`;

    const message = encodeURIComponent(
      `Your friend location is ${gmapUrl}. click above link`,
    );

    const link = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
    WebBrowser.openBrowserAsync(link);
  };

  const handleChangePhoneNumber = () => {
    setChangePhoneNumber(false);
  };

  useEffect(() => {
    AsyncStorage.getItem(StorageKeys.PHONE_NUMBER).then((res) => {
      if (res) {
        if (!validateNumber(res)) return;
        setPhoneNumber(res);
        setValue(res);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      {phoneNumber && !changePhoneNumber ? (
        <View>
          <Text
            style={styles.sendLocation}
          >{`Send Location to ${phoneNumber}`}</Text>
          <Button title="Send Location" onPress={handleSendLocation} />
          <View
            style={{
              marginVertical: 12,
            }}
          >
            <Button
              title="Change phone number"
              onPress={handleChangePhoneNumber}
            />
          </View>
        </View>
      ) : (
        <View>
          <Text>Enter receiver phone number.</Text>
          <TextInput
            style={styles.input}
            textContentType="telephoneNumber"
            keyboardType="numeric"
            onChangeText={textChangeHandler}
            value={value}
          />
          {error && <Text style={styles.errorMessage}>{error}</Text>}
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 30,
    width: 190,
    borderColor: "black",
    borderWidth: 2,
    color: "#595959",
    fontSize: 20,
    marginVertical: 12,
  },
  errorMessage: {
    color: "red",
    fontSize: 12,
    marginVertical: 12,
  },
  sendLocation: {
    color: "green",
    fontSize: 24,
    marginVertical: 12,
  },
});
