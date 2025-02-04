import React from "react";
import navigationStrings from "../constants/navigationStrings";
import * as Screens from "../screens";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Auth = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Auth.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Auth.Screen name={navigationStrings.LOGIN} component={Screens.Login} />
      <Auth.Screen
        name={navigationStrings.REGISTER}
        component={Screens.Register}
      />
      <Auth.Screen
        name={navigationStrings.CONFIRMATION}
        component={Screens.Confirmation}
      />
      <Auth.Screen
        name={navigationStrings.FORGOT_PASSWORD}
        component={Screens.ForgotPassword}
      />
    </Auth.Navigator>
  );
};

export default AuthStack;
