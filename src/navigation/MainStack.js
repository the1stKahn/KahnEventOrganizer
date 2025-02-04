import React from "react";
import navigationStrings from "../constants/navigationStrings";
import * as Screens from "../screens";
import TabNavigation from "./TabNavigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Main = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Main.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Main.Screen
        name={navigationStrings.CREATE_PROFILE}
        component={Screens.CreateProfile}
      />
      <Main.Screen
        name={navigationStrings.TAB_NAVIGATION}
        component={TabNavigation}
      />
      <Main.Screen
        name={navigationStrings.MEDICAL_TREATMENT}
        component={Screens.MedicalTreatment}
      />
      <Main.Screen
        name={navigationStrings.TEMPLATES}
        component={Screens.Templates}
      />
      <Main.Screen
        name={navigationStrings.EXAMINATION_TEMPLATE}
        component={Screens.ExaminationTemplate}
      />
      <Main.Screen
        name={navigationStrings.PRESCRIPTION_TEMPLATE}
        component={Screens.PrescriptionTemplate}
      />
      <Main.Screen
        name={navigationStrings.TREATMENT_PLAN_TEMPLATE}
        component={Screens.TreatmentPlanTemplate}
      />
      <Main.Screen
        name={navigationStrings.ADD_NEW_PATIENT}
        component={Screens.AddNewPatient}
      />
      <Main.Screen
        name={navigationStrings.EXAMINATION}
        component={Screens.Examination}
      />
      <Main.Screen
        name={navigationStrings.PRESCRIPTION}
        component={Screens.Prescription}
      />
      <Main.Screen
        name={navigationStrings.TREATMENT_PLAN}
        component={Screens.TreatmentPlan}
      />
      <Main.Screen
        name={navigationStrings.PATIENT_PROFILE}
        component={Screens.PatientProfile}
      />
      <Main.Screen
        name={navigationStrings.EDIT_PATIENT_PROFILE}
        component={Screens.EditPatientProfile}
      />
      <Main.Screen
        name={navigationStrings.EDIT_DOCTOR_PROFILE}
        component={Screens.EditDoctorProfile}
      />
      <Main.Screen
        name={navigationStrings.MY_INFORMATION}
        component={Screens.MyInformation}
      />
      <Main.Screen
        name={navigationStrings.ALL_TEMPLATES}
        component={Screens.AllTemplates}
      />
      <Main.Screen
        name={navigationStrings.SETTINGS}
        component={Screens.Settings}
      />
    </Main.Navigator>
  );
};

export default MainStack;
