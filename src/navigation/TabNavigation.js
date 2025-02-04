import * as React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import navigationStrings from "../constants/navigationStrings";
import * as Screens from "../screens";
import imagePath from "../constants/imagePath";
import {
  moderateScale,
  textScale,
  verticalScale,
} from "../styles/responsiveSize";
import colors from "../styles/colors";

const Tab = createBottomTabNavigator();

export default function TabNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          height: moderateScale(86),
          borderTopWidth: 1,
          borderColor: colors.gray04,
        },
      }}
    >
      <Tab.Screen
        name={navigationStrings.HOME}
        component={Screens.Home}
        options={{
          tabBarLabel: "Home",
          tabBarLabelStyle: { color: colors.black, bottom: verticalScale(10) },
          tabBarIcon: ({ focused }) => (
            <Image
              resizeMode="contain"
              source={imagePath.icHome}
              style={{
                width: moderateScale(24),
                height: moderateScale(24),
                tintColor: colors.black,
                opacity: focused ? 1 : 0.5,
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name={navigationStrings.PATIENT}
        component={Screens.Patient}
        options={{
          tabBarLabel: "Patient",
          tabBarLabelStyle: {
            color: colors.black,
            bottom: verticalScale(10),
          },
          tabBarIcon: ({ focused }) => (
            <Image
              resizeMode="contain"
              source={imagePath.icUser}
              style={{
                width: moderateScale(24),
                height: moderateScale(24),
                tintColor: colors.black,
                opacity: focused ? 1 : 0.5,
              }}
            />
          ),
        }}
      />

      <Tab.Screen
        name={navigationStrings.CREATE}
        component={Screens.Create}
        options={{
          tabBarLabel: "",
          tabBarLabelStyle: {
            color: colors.black,
            bottom: verticalScale(10),
          },
          tabBarIcon: () => (
            <View style={styles.thirdTabContainer}>
              <Image
                resizeMode="contain"
                source={imagePath.icCreateIcon}
                style={[
                  styles.thirdTabIcon,
                  { height: moderateScale(25), width: moderateScale(25) },
                ]}
              />
              <Text style={{ fontSize: textScale(14), color: colors.white }}>
                Create
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name={navigationStrings.AGENDA}
        component={Screens.Agenda}
        options={{
          tabBarLabel: "Agenda",
          tabBarLabelStyle: { color: colors.black, bottom: verticalScale(10) },
          tabBarIcon: ({ focused }) => (
            <Image
              resizeMode="contain"
              source={imagePath.icCalendar}
              style={{
                width: moderateScale(24),
                height: moderateScale(24),
                tintColor: colors.black,
                opacity: focused ? 1 : 0.5,
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name={navigationStrings.ACCOUNT}
        component={Screens.Account}
        options={{
          tabBarLabel: "Account",
          tabBarLabelStyle: { color: colors.black, bottom: verticalScale(10) },
          tabBarIcon: ({ focused }) => (
            <Image
              resizeMode="contain"
              source={imagePath.icDoctorMale}
              style={{
                width: moderateScale(24),
                height: moderateScale(24),
                tintColor: colors.black,
                opacity: focused ? 1 : 0.5,
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  thirdTabContainer: {
    position: "absolute",
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: colors.primary,
    top: moderateScale(-30),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  thirdTabIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    tintColor: colors.white,
  },
});
