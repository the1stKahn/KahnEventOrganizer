import imagePath from "./imagePath";
import navigationStrings from "./navigationStrings";

const bottom_tabs = [
  {
    id: 0,
    label: navigationStrings.HOME,
  },
  {
    id: 1,
    label: navigationStrings.PATIENT,
  },
  {
    id: 2,
    label: navigationStrings.AGENDA,
  },
  {
    id: 3,
    label: navigationStrings.ACCOUNT,
  },
];

const medicalHistory = [
  {
    id: 0,
    label: "Hypertension",
    selected: false,
  },
  {
    id: 1,
    label: "Diabetes",
    selected: false,
  },
  {
    id: 2,
    label: "Nerve Damage",
    selected: false,
  },
  {
    id: 3,
    label: "Hemorrhage",
    selected: false,
  },
  {
    id: 4,
    label: "Anemia",
    selected: false,
  },
  {
    id: 5,
    label: "Asthma",
    selected: false,
  },
  {
    id: 6,
    label: "Chemotherapy",
    selected: false,
  },
  {
    id: 7,
    label: "Radiofrequency Treatment",
    selected: false,
  },
  {
    id: 8,
    label: "Herpes",
    selected: false,
  },
  {
    id: 9,
    label: "Hepatitis",
    selected: false,
  },
  {
    id: 10,
    label: "TBC",
    selected: false,
  },
  {
    id: 11,
    label: "Heart Condition",
    selected: false,
  },
];

const profileOptions = [
  {
    id: 4,
    label: "Setup Medical Treatment",
    icon: imagePath.icSetup,
  },
  {
    id: 5,
    label: "Setup Template",
    icon: imagePath.icSetup,
  },

  {
    id: 7,
    label: "Logout",
    icon: imagePath.icLogOut,
  },
];

export default {
  bottom_tabs,
  medicalHistory,
  profileOptions,
};
