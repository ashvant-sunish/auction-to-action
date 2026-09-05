require("dotenv").config();
const mongoose = require("mongoose");
const RoundOne = require("./roundOne.model");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/auctiondb";

const bids = [
  {
    ID: 1,
    item_list: [
      {
        item_no: 1,
        items: [{ item_name: "Solar Panel Kit", quantity: 5 }],
        base_price: 5000,
        image_path: "/images/solar_panel.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 1,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 2,
    item_list: [
      {
        item_no: 2,
        items: [{ item_name: "Water Purifier System", quantity: 3 }],
        base_price: 4000,
        image_path: "/images/water_purifier.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 2,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 3,
    item_list: [
      {
        item_no: 3,
        items: [
          { item_name: "Property", quantity: 3 },
          { item_name: "Technology", quantity: 6 }
        ],
        base_price: 8000,
        image_path: "/images/property_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 3,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 4,
    item_list: [
      {
        item_no: 4,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Technology", quantity: 4 }
        ],
        base_price: 8000,
        image_path: "/images/property_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 4,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 5,
    item_list: [
      {
        item_no: 5,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Technology", quantity: 5 }
        ],
        base_price: 8000,
        image_path: "/images/property_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 5,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 6,
    item_list: [
      {
        item_no: 6,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Technology", quantity: 4 },
          { item_name: "Electricity Supply", quantity: 4 }
        ],
        base_price: 8000,
        image_path: "/images/property_tech_electricity.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 6,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 7,
    item_list: [
      {
        item_no: 7,
        items: [
          { item_name: "Technology", quantity: 4 },
          { item_name: "Property", quantity: 5 }
        ],
        base_price: 7500,
        image_path: "/images/property_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 7,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 8,
    item_list: [
      {
        item_no: 8,
        items: [
          { item_name: "Technology", quantity: 6 },
          { item_name: "Skilled Labour", quantity: 3 }
        ],
        base_price: 7500,
        image_path: "/images/technology_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 8,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 9,
    item_list: [
      {
        item_no: 9,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Machinery & Tools", quantity: 6 }
        ],
        base_price: 7500,
        image_path: "/images/property_machinery.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 9,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 10,
    item_list: [
      {
        item_no: 10,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Machinery & Tools", quantity: 5 },
          { item_name: "Electricity Supply", quantity: 4 }
        ],
        base_price: 7500,
        image_path: "/images/property_machinery_electricity.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 10,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 11,
    item_list: [
      {
        item_no: 11,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Technology", quantity: 4 },
          { item_name: "Machinery & Tools", quantity: 4 }
        ],
        base_price: 7500,
        image_path: "/images/property_tech_machinery.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 11,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 12,
    item_list: [
      {
        item_no: 12,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Technology", quantity: 4 }
        ],
        base_price: 7000,
        image_path: "/images/property_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 12,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 13,
    item_list: [
      {
        item_no: 13,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Office Space", quantity: 4 },
          { item_name: "Technology", quantity: 4 }
        ],
        base_price: 7000,
        image_path: "/images/property_office_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 13,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 14,
    item_list: [
      {
        item_no: 14,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Construction Material", quantity: 4 },
          { item_name: "Technology", quantity: 3 }
        ],
        base_price: 7000,
        image_path: "/images/property_construction_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 14,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 15,
    item_list: [
      {
        item_no: 15,
        items: [
          { item_name: "Office Space", quantity: 4 },
          { item_name: "Technology", quantity: 6 }
        ],
        base_price: 7000,
        image_path: "/images/office_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 15,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 16,
    item_list: [
      {
        item_no: 16,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Office Space", quantity: 4 },
          { item_name: "Technology", quantity: 3 }
        ],
        base_price: 7000,
        image_path: "/images/property_office_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 16,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 17,
    item_list: [
      {
        item_no: 17,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Transportation", quantity: 4 },
          { item_name: "Technology", quantity: 3 }
        ],
        base_price: 7000,
        image_path: "/images/property_transportation_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 17,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 18,
    item_list: [
      {
        item_no: 18,
        items: [
          { item_name: "Property", quantity: 3 },
          { item_name: "Technology", quantity: 5 },
          { item_name: "Utilities", quantity: 4 }
        ],
        base_price: 7000,
        image_path: "/images/property_technology_utilities.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 18,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 19,
    item_list: [
      {
        item_no: 19,
        items: [
          { item_name: "Electricity Supply", quantity: 6 },
          { item_name: "Technology", quantity: 4 }
        ],
        base_price: 7000,
        image_path: "/images/electricity_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 19,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 20,
    item_list: [
      {
        item_no: 20,
        items: [
          { item_name: "Machinery & Tools", quantity: 4 },
          { item_name: "Technology", quantity: 5 },
          { item_name: "Skilled Labour", quantity: 3 }
        ],
        base_price: 7000,
        image_path: "/images/machinery_technology_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 20,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 21,
    item_list: [
      {
        item_no: 21,
        items: [{ item_name: "Technology", quantity: 6 }],
        base_price: 7000,
        image_path: "/images/technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 21,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 22,
    item_list: [
      {
        item_no: 22,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Skilled Labour", quantity: 4 },
          { item_name: "Technology", quantity: 4 }
        ],
        base_price: 7500,
        image_path: "/images/property_labour_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 22,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 23,
    item_list: [
      {
        item_no: 23,
        items: [
          { item_name: "Technology", quantity: 3 },
          { item_name: "Property", quantity: 5 }
        ],
        base_price: 6500,
        image_path: "/images/technology_property.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 23,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 24,
    item_list: [
      {
        item_no: 24,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Office Space", quantity: 4 }
        ],
        base_price: 6500,
        image_path: "/images/property_office.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 24,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 25,
    item_list: [
      {
        item_no: 25,
        items: [
          { item_name: "Property", quantity: 3 },
          { item_name: "Office Space", quantity: 4 },
          { item_name: "Technology", quantity: 4 }
        ],
        base_price: 6500,
        image_path: "/images/property_office_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 25,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 26,
    item_list: [
      {
        item_no: 26,
        items: [
          { item_name: "Technology", quantity: 4 },
          { item_name: "Office Space", quantity: 4 }
        ],
        base_price: 6500,
        image_path: "/images/technology_office.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 26,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 27,
    item_list: [
      {
        item_no: 27,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Technology", quantity: 3 },
          { item_name: "Utilities", quantity: 4 }
        ],
        base_price: 6500,
        image_path: "/images/property_technology_utilities.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 27,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 28,
    item_list: [
      {
        item_no: 28,
        items: [
          { item_name: "Electricity Supply", quantity: 6 },
          { item_name: "Technology", quantity: 3 }
        ],
        base_price: 6500,
        image_path: "/images/electricity_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 28,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 29,
    item_list: [
      {
        item_no: 29,
        items: [
          { item_name: "Office Space", quantity: 4 },
          { item_name: "Machinery & Tools", quantity: 6 }
        ],
        base_price: 6500,
        image_path: "/images/office_machinery.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 29,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 30,
    item_list: [
      {
        item_no: 30,
        items: [
          { item_name: "Property", quantity: 3 },
          { item_name: "Technology", quantity: 4 },
          { item_name: "Electricity Supply", quantity: 5 }
        ],
        base_price: 6500,
        image_path: "/images/property_technology_electricity.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 30,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 31,
    item_list: [
      {
        item_no: 31,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Office Space", quantity: 4 },
          { item_name: "Electricity Supply", quantity: 4 }
        ],
        base_price: 6500,
        image_path: "/images/property_office_electricity.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 31,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 32,
    item_list: [
      {
        item_no: 32,
        items: [
          { item_name: "Property", quantity: 6 },
          { item_name: "Skilled Labour", quantity: 5 }
        ],
        base_price: 6500,
        image_path: "/images/property_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 32,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 33,
    item_list: [
      {
        item_no: 33,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Technology", quantity: 4 }
        ],
        base_price: 6000,
        image_path: "/images/property_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 33,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 34,
    item_list: [
      {
        item_no: 34,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Office Space", quantity: 5 }
        ],
        base_price: 6000,
        image_path: "/images/property_office.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 34,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 35,
    item_list: [
      {
        item_no: 35,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Electricity Supply", quantity: 4 }
        ],
        base_price: 6000,
        image_path: "/images/property_electricity.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 35,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 36,
    item_list: [
      {
        item_no: 36,
        items: [
          { item_name: "Machinery & Tools", quantity: 4 },
          { item_name: "Technology", quantity: 4 }
        ],
        base_price: 6000,
        image_path: "/images/machinery_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 36,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 37,
    item_list: [
      {
        item_no: 37,
        items: [
          { item_name: "Machinery & Tools", quantity: 6 },
          { item_name: "Technology", quantity: 3 }
        ],
        base_price: 6000,
        image_path: "/images/machinery_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 37,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 38,
    item_list: [
      {
        item_no: 38,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Skilled Labour", quantity: 6 }
        ],
        base_price: 6000,
        image_path: "/images/property_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 38,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 39,
    item_list: [
      {
        item_no: 39,
        items: [
          { item_name: "Technology", quantity: 4 },
          { item_name: "Machinery & Tools", quantity: 4 },
          { item_name: "Electricity Supply", quantity: 3 }
        ],
        base_price: 6000,
        image_path: "/images/technology_machinery_electricity.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 39,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 40,
    item_list: [
      {
        item_no: 40,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Construction Material", quantity: 5 },
          { item_name: "Skilled Labour", quantity: 3 }
        ],
        base_price: 6000,
        image_path: "/images/property_construction_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 40,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 41,
    item_list: [
      {
        item_no: 41,
        items: [{ item_name: "Property", quantity: 6 }],
        base_price: 6000,
        image_path: "/images/property.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 41,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 42,
    item_list: [
      {
        item_no: 42,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Skilled Labour", quantity: 6 },
          { item_name: "Utilities", quantity: 4 }
        ],
        base_price: 6000,
        image_path: "/images/property_labour_utilities.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 42,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 43,
    item_list: [
      {
        item_no: 43,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Construction Material", quantity: 5 },
          { item_name: "Machinery & Tools", quantity: 4 }
        ],
        base_price: 6000,
        image_path: "/images/property_construction_machinery.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 43,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 44,
    item_list: [
      {
        item_no: 44,
        items: [
          { item_name: "Technology", quantity: 4 },
          { item_name: "Transportation", quantity: 5 }
        ],
        base_price: 6000,
        image_path: "/images/technology_transportation.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 44,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 45,
    item_list: [
      {
        item_no: 45,
        items: [{ item_name: "Technology", quantity: 5 }],
        base_price: 5500,
        image_path: "/images/technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 45,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 46,
    item_list: [
      {
        item_no: 46,
        items: [
          { item_name: "Machinery & Tools", quantity: 5 },
          { item_name: "Skilled Labour", quantity: 4 }
        ],
        base_price: 5500,
        image_path: "/images/machinery_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 46,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 47,
    item_list: [
      {
        item_no: 47,
        items: [
          { item_name: "Technology", quantity: 4 },
          { item_name: "Skilled Labour", quantity: 5 }
        ],
        base_price: 5500,
        image_path: "/images/technology_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 47,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 48,
    item_list: [
      {
        item_no: 48,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Transportation", quantity: 3 }
        ],
        base_price: 5500,
        image_path: "/images/property_transportation.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 48,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 49,
    item_list: [
      {
        item_no: 49,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Construction Material", quantity: 4 }
        ],
        base_price: 5500,
        image_path: "/images/property_construction.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 49,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 50,
    item_list: [
      {
        item_no: 50,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Skilled Labour", quantity: 6 },
          { item_name: "Utilities", quantity: 4 }
        ],
        base_price: 5500,
        image_path: "/images/property_labour_utilities.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 50,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 51,
    item_list: [
      {
        item_no: 51,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Machinery & Tools", quantity: 4 },
          { item_name: "Electricity Supply", quantity: 4 }
        ],
        base_price: 5500,
        image_path: "/images/property_machinery_electricity.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 51,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 52,
    item_list: [
      {
        item_no: 52,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Utilities", quantity: 5 }
        ],
        base_price: 5500,
        image_path: "/images/property_utilities.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 52,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 53,
    item_list: [
      {
        item_no: 53,
        items: [
          { item_name: "Machinery & Tools", quantity: 6 },
          { item_name: "Skilled Labour", quantity: 4 }
        ],
        base_price: 5500,
        image_path: "/images/machinery_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 53,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 54,
    item_list: [
      {
        item_no: 54,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Electricity Supply", quantity: 6 }
        ],
        base_price: 5500,
        image_path: "/images/property_electricity.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 54,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 55,
    item_list: [
      {
        item_no: 55,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Transportation", quantity: 4 }
        ],
        base_price: 5500,
        image_path: "/images/property_transportation.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 55,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 56,
    item_list: [
      {
        item_no: 56,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Skilled Labour", quantity: 4 },
          { item_name: "Machinery & Tools", quantity: 4 }
        ],
        base_price: 5500,
        image_path: "/images/property_labour_machinery.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 56,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 57,
    item_list: [
      {
        item_no: 57,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Transportation", quantity: 4 },
          { item_name: "Machinery & Tools", quantity: 4 }
        ],
        base_price: 5500,
        image_path: "/images/property_transportation_machinery.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 57,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 58,
    item_list: [
      {
        item_no: 58,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Electricity Supply", quantity: 5 },
          { item_name: "Skilled Labour", quantity: 4 }
        ],
        base_price: 5500,
        image_path: "/images/property_electricity_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 58,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 59,
    item_list: [
      {
        item_no: 59,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Office Space", quantity: 4 },
          { item_name: "Skilled Labour", quantity: 5 }
        ],
        base_price: 5500,
        image_path: "/images/property_office_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 59,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 60,
    item_list: [
      {
        item_no: 60,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Electricity Supply", quantity: 4 },
          { item_name: "Machinery & Tools", quantity: 4 }
        ],
        base_price: 5500,
        image_path: "/images/property_electricity_machinery.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 60,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 61,
    item_list: [
      {
        item_no: 61,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Skilled Labour", quantity: 5 }
        ],
        base_price: 5000,
        image_path: "/images/property_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 61,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 62,
    item_list: [
      {
        item_no: 62,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Construction Material", quantity: 4 },
          { item_name: "Skilled Labour", quantity: 3 }
        ],
        base_price: 5000,
        image_path: "/images/property_construction_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 62,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 63,
    item_list: [
      {
        item_no: 63,
        items: [
          { item_name: "Property", quantity: 3 },
          { item_name: "Machinery & Tools", quantity: 5 },
          { item_name: "Utilities", quantity: 4 }
        ],
        base_price: 5000,
        image_path: "/images/property_machinery_utilities.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 63,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 64,
    item_list: [
      {
        item_no: 64,
        items: [
          { item_name: "Machinery & Tools", quantity: 5 },
          { item_name: "Construction Material", quantity: 5 }
        ],
        base_price: 5000,
        image_path: "/images/machinery_construction.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 64,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 65,
    item_list: [
      {
        item_no: 65,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Transportation", quantity: 5 }
        ],
        base_price: 5000,
        image_path: "/images/property_transportation.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 65,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 66,
    item_list: [
      {
        item_no: 66,
        items: [
          { item_name: "Electricity Supply", quantity: 6 },
          { item_name: "Skilled Labour", quantity: 4 }
        ],
        base_price: 5000,
        image_path: "/images/electricity_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 66,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 67,
    item_list: [
      {
        item_no: 67,
        items: [
          { item_name: "Skilled Labour", quantity: 7 },
          { item_name: "Office Space", quantity: 4 }
        ],
        base_price: 5000,
        image_path: "/images/labour_office.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 67,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 68,
    item_list: [
      {
        item_no: 68,
        items: [
          { item_name: "Office Space", quantity: 6 },
          { item_name: "Skilled Labour", quantity: 4 }
        ],
        base_price: 5000,
        image_path: "/images/office_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 68,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 69,
    item_list: [
      {
        item_no: 69,
        items: [
          { item_name: "Machinery & Tools", quantity: 6 },
          { item_name: "Utilities", quantity: 4 }
        ],
        base_price: 5000,
        image_path: "/images/machinery_utilities.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 69,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 70,
    item_list: [
      {
        item_no: 70,
        items: [
          { item_name: "Property", quantity: 3 },
          { item_name: "Skilled Labour", quantity: 4 },
          { item_name: "Machinery & Tools", quantity: 5 }
        ],
        base_price: 5000,
        image_path: "/images/property_labour_machinery.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 70,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 71,
    item_list: [
      {
        item_no: 71,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Utilities", quantity: 5 },
          { item_name: "Skilled Labour", quantity: 4 }
        ],
        base_price: 5000,
        image_path: "/images/property_utilities_labour.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 71,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 72,
    item_list: [
      {
        item_no: 72,
        items: [
          { item_name: "Property", quantity: 3 },
          { item_name: "Skilled Labour", quantity: 7 },
          { item_name: "Utilities", quantity: 5 }
        ],
        base_price: 5000,
        image_path: "/images/property_labour_utilities.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 72,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 73,
    item_list: [
      {
        item_no: 73,
        items: [
          { item_name: "Property", quantity: 4 },
          { item_name: "Skilled Labour", quantity: 5 },
          { item_name: "Utilities", quantity: 5 }
        ],
        base_price: 5000,
        image_path: "/images/property_labour_utilities2.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 73,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 74,
    item_list: [
      {
        item_no: 74,
        items: [
          { item_name: "Property", quantity: 5 },
          { item_name: "Skilled Labour", quantity: 4 },
          { item_name: "Technology", quantity: 4 }
        ],
        base_price: 7500,
        image_path: "/images/property_labour_technology.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 74,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  },
  {
    ID: 75,
    item_list: [
      {
        item_no: 75,
        items: [
          { item_name: "Technology", quantity: 4 },
          { item_name: "Machinery & Tools", quantity: 4 },
          { item_name: "Electricity Supply", quantity: 3 }
        ],
        base_price: 6000,
        image_path: "/images/technology_machinery_electricity.png"
      }
    ],
    item_list_bidded: [
      {
        item_no: 75,
        items: [{ item_name: "", quantity: 0 }],
        base_price: null,
        image_path: ""
      }
    ]
  }
  
];

// Seeder function
async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("✅ Connected to MongoDB");

    // Clear old round one data
    await RoundOne.deleteMany({});
    console.log("🗑️ Cleared old Round 1 bids");

    // Insert fresh data
    await RoundOne.insertMany(bids);
    console.log("🎉 Round 1 bids seeded successfully");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
}

seedData();
