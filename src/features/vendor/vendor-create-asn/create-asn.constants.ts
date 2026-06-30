export const warehouseTypeOptions = [
  { label: "SD60 – Non-Controlled", value: "SD60" },
  { label: "SD61 – Controlled",     value: "SD61" },
];

export const packageTypeOptions = [
  { label: "Box",    value: "Box"    },
  { label: "Carton", value: "Carton" },
  { label: "Pallet", value: "Pallet" },
  { label: "Drum",   value: "Drum"   },
  { label: "Bag",    value: "Bag"    },
];

export const weightUnitOptions = [
  { label: "KG",  value: "KG"  },
  { label: "LBS", value: "LBS" },
];

export const uomOptions = [
  { label: "EA (Each)",   value: "EA" },
  { label: "BX (Box)",    value: "BX" },
  { label: "CT (Carton)", value: "CT" },
];

// shipmentMode values must match backend enum exactly
export const shipmentModeOptions = [
  { label: "Air",  value: "AIR"  },
  { label: "Road", value: "ROAD" },
  { label: "Rail", value: "RAIL" },
  { label: "Sea",  value: "SEA"  },
];

export const carrierOptions = [
  { label: "FedEx",     value: "FedEx"     },
  { label: "UPS",       value: "UPS"       },
  { label: "DHL",       value: "DHL"       },
  { label: "Blue Dart", value: "Blue Dart" },
];