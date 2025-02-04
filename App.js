import { View, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import Routes from "./src/navigation/Route";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./src/database/firebase";
import { doc, getDoc } from "firebase/firestore";
import { navigate } from "./src/navigation/RootNavigation";
import SplashScreen from "react-native-splash-screen";
import navigationStrings from "./src/constants/navigationStrings";
import { useFonts } from "expo-font";

const App = () => {
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const data = docSnap.data();
        if (data.isProfileCreated === "true") {
          navigateToTabNavigation();
          SplashScreen.hide();
        } else {
          navigateToCreateProfile(user.email);
          SplashScreen.hide();
        }
      } else {
        navigateToLogin();
        SplashScreen.hide();
      }
    });
    return () => subscriber();
  }, []);
  const [fontsLoaded] = useFonts({
    "I-Bold": require("./src/assets/fonts/Inter-Bold.ttf"),
    "I-Light": require("./src/assets/fonts/Inter-Light.ttf"),
    "I-Medium": require("./src/assets/fonts/Inter-Medium.ttf"),
    "I-Regular": require("./src/assets/fonts/Inter-Regular.ttf"),
    "I-SemiBold": require("./src/assets/fonts/Inter-SemiBold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  // Navigation callbacks (implement these functions)
  const navigateToTabNavigation = () => {
    navigate(navigationStrings.MAIN, {
      screen: navigationStrings.TAB_NAVIGATION,
    });
  };

  const navigateToCreateProfile = (email) => {
    navigate(navigationStrings.MAIN, {
      screen: navigationStrings.CREATE_PROFILE,
      params: { emailOfDoctor: email },
    });
  };

  const navigateToLogin = () => {
    navigate(navigationStrings.AUTH, {
      screen: navigationStrings.LOGIN,
    });
  };
  return (
    <View style={styles.container}>
      <Routes />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
