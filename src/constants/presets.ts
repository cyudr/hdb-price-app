import { PredictionFormData } from "../types.ts";

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
