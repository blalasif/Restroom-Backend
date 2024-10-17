// import mongoose from "mongoose";

// const { Schema } = mongoose;

// const BuildingSchema = new Schema(
//   {
//     buildingName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     buildingType: {
//       type: String,
//       required: true,
//       enum: ["Public", "Private", "Commercial", "Industrial", "Mixed-Use"],
//     },
//     location: {
//       type: String,
//       required: true,
//     },
//     area: {
//       type: String,
//       required: true,
//     },
//     totalFloors: {
//       type: Number,
//       required: true,
//     },
//     totalRestrooms: {
//       type: Number,
//       required: true,
//     },
//     buildingManager: {
//       type: String,
//       required: true,
//     },
//     contact: {
//       type: String,
//       required: true,
//     },

//     //   publicId: {
//     //     type: String,
//     //     required: true,
//     //   },
//     //   image: {
//     //     type: String,
//     //     required: true,
//     //   },
//     // },
//     // modalImage: {
//     //   publicId: {
//     //     type: String,
//     //     required: true,
//     //   },
//     //   image: {
//     //     type: String,
//     //     required: true,
//     //   },
//     // },
//     thumbnail: {
//       image: {
//         publicId: { type: String, required: true },
//         url: { type: String, required: true },
//       },
//     },
//     modalImage: {
//       image: {
//         publicId: { type: String, required: true },
//         url: { type: String, required: true },
//       },
//     },

//     Latitude: {
//       type: Number,
//       required: true,
//     },
//     Longitude: {
//       type: Number,
//       required: true,
//     },
//     restrooms: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Restroom",
//         required: true,
//       },
//     ],
//     buildingOwner: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Auth",
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Building = mongoose.model("Building", BuildingSchema);
// export default Building;

import mongoose from "mongoose";

const { Schema } = mongoose;

const BuildingSchema = new Schema(
  {
    buildingName: {
      type: String,
      required: true,
      trim: true,
    },
    buildingType: {
      type: String,
      required: true,
      enum: ["Public", "Private", "Commercial", "Industrial", "Mixed-Use"],
    },
    location: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    totalFloors: {
      type: Number,
      required: true,
    },
    totalRestrooms: {
      type: Number,
      required: true,
    },
    buildingManager: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    thumbnail: {
      image: {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
      },
    },
    modalImage: {
      image: {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
      },
    },
    Latitude: {
      type: Number,
      required: true,
    },
    Longitude: {
      type: Number,
      required: true,
    },
    restrooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restroom",
      },
    ],
    buildingOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Building = mongoose.model("Building", BuildingSchema);
export default Building;
