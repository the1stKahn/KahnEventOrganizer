import React from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import navigationStrings from "../constants/navigationStrings";
import { navigationRef } from "./RootNavigation";

const Stack = createNativeStackNavigator();

const Routes = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={navigationStrings.AUTH} component={AuthStack} />
        <Stack.Screen name={navigationStrings.MAIN} component={MainStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
