// import mongoose from "mongoose";

// const { Schema } = mongoose;

// const RestroomSchema = new Schema(
//   {
//     restroomName: {
//       type: String,
//       required: true,
//     },
//     type: {
//       type: String,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["Open", "Closed", "Under Maintenance"],
//       required: true,
//     },
//     area: {
//       type: Number,
//       required: true,
//     },
//     numberOfToilets: {
//       type: Number,
//       required: true,
//     },
//     image: {
//       publicId: {
//         type: String,
//         required: true,
//       },
//       url: {
//         type: String,
//         required: true,
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Restroom = mongoose.model("Restroom", RestroomSchema);
// export default Restroom;

import mongoose from "mongoose";

const { Schema } = mongoose;

const RestroomSchema = new Schema(
  {
    restroomName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Male","Female","Unisex"], 
    },
    status: {
      type: String,
      enum: ["Open", "Closed", "Under Maintenance"],
      required: true,
    },
    area: {
      type: Number,
      required: true,
    },
    numberOfToilets: {
      type: Number,
      required: true,
    },
    image: {
      publicId: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: true,
      
    },
  },
  {
    timestamps: true,
  }
);

const Restroom = mongoose.model("Restroom", RestroomSchema);
export default Restroom;
