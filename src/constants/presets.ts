import { HdbOptions, PredictionFormData } from "../types.ts";

export const DEFAULT_HDB_OPTIONS: HdbOptions = {
  town: [
    "ANG MO KIO", "BEDOK", "BISHAN", "BUKIT BATOK", "BUKIT MERAH",
    "BUKIT PANJANG", "BUKIT TIMAH", "CENTRAL AREA", "CHOA CHU KANG",
    "CLEMENTI", "GEYLANG", "HOUGANG", "JURONG EAST", "JURONG WEST",
    "KALLANG/WHAMPOA", "MARINE PARADE", "PASIR RIS", "PUNGGOL",
    "QUEENSTOWN", "SEMBAWANG", "SENGKANG", "SERANGOON", "TAMPINES",
    "TOA PAYOH", "WOODLANDS", "YISHUN"
  ],
  flat_type: [
    "1 ROOM", "2 ROOM", "3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE", "MULTI-GENERATION"
  ],
  flat_model: [
    "Model A", "Improved", "New Generation", "Premium Apartment",
    "Simplified", "Standard", "Maisonette", "Apartment", "Model A2",
    "DBSS", "Terrace", "Adjoined flat", "Multi Generation",
    "Premium Maisonette", "Type S1", "Type S2"
  ],
  storey_range: [
    "01 TO 03", "04 TO 06", "07 TO 09", "10 TO 12", "13 TO 15",
    "16 TO 18", "19 TO 21", "22 TO 24", "25 TO 27", "28 TO 30",
    "31 TO 33", "34 TO 36", "37 TO 39", "40 TO 42", "43 TO 45",
    "46 TO 48", "49 TO 51"
  ]
};

export interface PresetItem {
  label: string;
  data: {
    town: string;
    flat_type: string;
    flat_model: string;
    storey_range: string;
    floor_area_sqm: number;
    lease_commence_date: number;
  };
}

export const INITIAL_FORM: PredictionFormData = {
  town: "",
  flat_type: "",
  flat_model: "",
  storey_range: "",
  floor_area_sqm: "",
  lease_commence_date: "",
};

export const PRESETS: PresetItem[] = [
  {
    label: "Bishan 4-Room High Floor",
    data: {
      town: "BISHAN",
      flat_type: "4 ROOM",
      flat_model: "Model A",
      storey_range: "19 TO 21",
      floor_area_sqm: 93,
      lease_commence_date: 1998,
    },
  },
  {
    label: "Punggol 5-Room Premium",
    data: {
      town: "PUNGGOL",
      flat_type: "5 ROOM",
      flat_model: "Premium Apartment",
      storey_range: "10 TO 12",
      floor_area_sqm: 112,
      lease_commence_date: 2014,
    },
  },
  {
    label: "Queenstown 3-Room",
    data: {
      town: "QUEENSTOWN",
      flat_type: "3 ROOM",
      flat_model: "Improved",
      storey_range: "07 TO 09",
      floor_area_sqm: 68,
      lease_commence_date: 1978,
    },
  },
  {
    label: "Tampines Executive Maisonette",
    data: {
      town: "TAMPINES",
      flat_type: "EXECUTIVE",
      flat_model: "Maisonette",
      storey_range: "04 TO 06",
      floor_area_sqm: 145,
      lease_commence_date: 1993,
    },
  },
];
