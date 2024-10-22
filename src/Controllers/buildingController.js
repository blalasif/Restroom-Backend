import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import Building from "../models/buildingModal.js";
import Restroom from "../models/restroomModel.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { buildingValidation } from "../validationSchemas/buildingValidation.js";

export const addBuilding = AsyncHandler(async (req, res, next) => {
  const { thumbnail, modalImage, restroomImages } = req.files || {};

  const {
    buildingName,
    buildingType,
    location,
    area,
    totalFloors,
    totalRestrooms,
    buildingManager,
    contact,
    restrooms,
    Longitude,
    Latitude,
  } = req.body;

  const longitude = parseFloat(Longitude);
  const latitude = parseFloat(Latitude);

  const { error } = buildingValidation.validate({
    buildingName,
    buildingType,
    location,
    area,
    totalFloors,
    totalRestrooms,
    buildingManager,
    contact,
    Longitude: longitude,
    Latitude: latitude,
  });

  if (error) return next(new ApiError(400, error.details[0].message));

  if (!thumbnail || !thumbnail[0])
    return next(new ApiError(400, "Thumbnail image is required"));

  if (!modalImage || !modalImage[0])
    return next(new ApiError(400, "Modal image is required"));
  if (!restroomImages || restroomImages.length === 0)
    return next(new ApiError(400, "At least one restroom image is required"));

  let parsedRestrooms;
  try {
    parsedRestrooms = JSON.parse(restrooms);
  } catch (parseError) {
    return next(new ApiError(400, "Restrooms data is not valid JSON."));
  }

  if (
    !Array.isArray(parsedRestrooms) ||
    parsedRestrooms.length !== parseInt(totalRestrooms, 10)
  )
    return next(
      new ApiError(
        400,
        `Expected ${totalRestrooms} restrooms, but got ${parsedRestrooms.length}`
      )
    );

  const thumbnailUrl = await uploadToCloudinary(
    thumbnail[0].buffer,
    "buildings"
  );
  const modalImageUrl = await uploadToCloudinary(
    modalImage[0].buffer,
    "buildings"
  );

  const savedBuilding = await Building.create({
    buildingName,
    buildingType,
    location,
    area,
    totalFloors,
    totalRestrooms,
    buildingManager,
    contact,
    thumbnail: {
      image: {
        publicId: thumbnailUrl.public_id,
        url: thumbnailUrl.secure_url,
      },
    },
    modalImage: {
      image: {
        publicId: modalImageUrl.public_id,
        url: modalImageUrl.secure_url,
      },
    },
    Longitude: longitude,
    Latitude: latitude,
    buildingOwner: req.user.id,
  });

  const restroomIds = [];

  for (let index = 0; index < parsedRestrooms.length; index++) {
    try {
      if (!restroomImages[index])
        return next(
          new ApiError(400, `Restroom image at index ${index} is undefined`)
        );

      const restroomImageUrl = await uploadToCloudinary(
        restroomImages[index].buffer,
        "restrooms"
      );
      console.log(`Uploaded restroom image ${index}:`, restroomImageUrl);

      const restroom = await Restroom.create({
        ...parsedRestrooms[index],
        image: {
          publicId: restroomImageUrl.public_id,
          url: restroomImageUrl.secure_url,
        },
        building: savedBuilding._id,
      });

      restroomIds.push(restroom._id);
    } catch (uploadError) {
      console.error(`Error uploading restroom image ${index}:`, uploadError);
      return next(
        new ApiError(500, `Failed to upload restroom image ${index}.`)
      );
    }
  }

  savedBuilding.restrooms = restroomIds;
  await savedBuilding.save();

  return res.status(201).json({
    message: "Building Created Successfully",
    success: true,
    Building: savedBuilding,
  });
});

export const getAllBuildings = AsyncHandler(async (req, res, next) => {
  const ownerId = req.user.id;

  const buildings = await Building.find({ buildingOwner: ownerId });
  if (!buildings || buildings.length === 0)
    return next(new ApiError(404, "No Building Regards this User"));

  return res.status(200).json({
    message: "All Buildings",
    success: true,
    Buildngs: buildings,
  });
});

export const deleteBuilding = AsyncHandler(async (req, res, next) => {
  const { buildingId } = req.params;

  const building = await Building.findById(buildingId);
  if (!building) return next(new ApiError(404, "Building not found"));

  try {
    if (building.thumbnail && building.thumbnail.image.publicId) {
      await deleteFromCloudinary(building.thumbnail.image.publicId);
    }

    if (building.modalImage && building.modalImage.image.publicId) {
      await deleteFromCloudinary(building.modalImage.image.publicId);
    }

    if (building.restrooms && building.restrooms.length > 0) {
      for (const restroomId of building.restrooms) {
        const restroom = await Restroom.findById(restroomId);
        if (restroom && restroom.image && restroom.image.publicId) {
          await deleteFromCloudinary(restroom.image.publicId);
        }
        if (restroom) {
          await restroom.deleteOne();
        }
      }
    }

    await building.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Building and its associated restrooms deleted successfully.",
    });
  } catch (error) {
    console.error("Error during deletion process:", error);
    return next(
      new ApiError(500, "Error deleting the building and associated restrooms.")
    );
  }
});

export const getSingleBuilding = AsyncHandler(async (req, res, next) => {
  const { buildingId } = req.params;

  const building = await Building.findById(buildingId);

  if (!building) return next(new ApiError(404, "Building not found"));

  return res.status(200).json({
    message: "Building Found",
    success: true,
    Building: building,
  });
});

export const updateBuilding = AsyncHandler(async (req, res, next) => {
  const { buildingId } = req.params;
  const { thumbnail, modalImage, restroomImages } = req.files || {};

  const {
    buildingName,
    buildingType,
    location,
    area,
    totalFloors,
    totalRestrooms,
    buildingManager,
    contact,
    restrooms,
    Longitude,
    Latitude,
  } = req.body;

  const longitude = parseFloat(Longitude);
  const latitude = parseFloat(Latitude);

  const { error } = buildingValidation.validate({
    buildingName,
    buildingType,
    location,
    area,
    totalFloors,
    totalRestrooms,
    buildingManager,
    contact,
    Longitude: longitude,
    Latitude: latitude,
  });

  if (error) return next(new ApiError(400, error.details[0].message));

  const building = await Building.findById(buildingId);
  if (!building) return next(new ApiError(404, "Building not found"));

  try {
    if (thumbnail && thumbnail[0]) {
      if (
        building.thumbnail &&
        building.thumbnail.image &&
        building.thumbnail.image.publicId
      ) {
        await deleteFromCloudinary(building.thumbnail.image.publicId);
      }
      const thumbnailUrl = await uploadToCloudinary(
        thumbnail[0].buffer,
        "buildings"
      );
      building.thumbnail = {
        image: {
          publicId: thumbnailUrl.public_id,
          url: thumbnailUrl.secure_url,
        },
      };
    }

    if (modalImage && modalImage[0]) {
      if (
        building.modalImage &&
        building.modalImage.image &&
        building.modalImage.image.publicId
      ) {
        await deleteFromCloudinary(building.modalImage.image.publicId);
      }
      const modalImageUrl = await uploadToCloudinary(
        modalImage[0].buffer,
        "buildings"
      );
      building.modalImage = {
        image: {
          publicId: modalImageUrl.public_id,
          url: modalImageUrl.secure_url,
        },
      };
    }

    let parsedRestrooms;
    try {
      parsedRestrooms = JSON.parse(restrooms);
    } catch (parseError) {
      return next(new ApiError(400, "Restrooms data is not valid JSON."));
    }

    if (
      !Array.isArray(parsedRestrooms) ||
      parsedRestrooms.length !== parseInt(totalRestrooms, 10)
    ) {
      return next(
        new ApiError(
          400,
          `Expected ${totalRestrooms} restrooms, but got ${parsedRestrooms.length}`
        )
      );
    }

    const restroomIds = [];

    for (let index = 0; index < parsedRestrooms.length; index++) {
      const restroomData = parsedRestrooms[index];

      if (restroomImages && restroomImages[index]) {
        const existingRestroom = restroomData._id
          ? await Restroom.findById(restroomData._id)
          : null;

        if (
          existingRestroom &&
          existingRestroom.image &&
          existingRestroom.image.publicId
        ) {
          await deleteFromCloudinary(existingRestroom.image.publicId);
        }

        const restroomImageUrl = await uploadToCloudinary(
          restroomImages[index].buffer,
          "restrooms"
        );
        restroomData.image = {
          publicId: restroomImageUrl.public_id,
          url: restroomImageUrl.secure_url,
        };
      }

      let restroom;
      try {
        if (restroomData._id) {
          restroom = await Restroom.findByIdAndUpdate(
            restroomData._id,
            restroomData,
            { new: true }
          );
        } else {
          restroom = await Restroom.create({
            ...restroomData,
            building: building._id,
          });
        }
      } catch (restroomError) {
        return next(
          new ApiError(
            400,
            `Restroom update/create error: ${restroomError.message}`
          )
        );
      }

      restroomIds.push(restroom._id);
    }

    building.buildingName = buildingName;
    building.buildingType = buildingType;
    building.location = location;
    building.area = area;
    building.totalFloors = totalFloors;
    building.totalRestrooms = totalRestrooms;
    building.buildingManager = buildingManager;
    building.contact = contact;
    building.Longitude = longitude;
    building.Latitude = latitude;
    building.restrooms = restroomIds;

    await building.save();

    return res.status(200).json({
      message: "Building Updated Successfully",
      success: true,
      data: building,
    });
  } catch (err) {
    return next(new ApiError(500, `Error updating building: ${err.message}`));
  }
});
