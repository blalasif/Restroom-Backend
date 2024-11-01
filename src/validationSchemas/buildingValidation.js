import Joi from "joi";
export const buildingValidation = Joi.object({
  buildingName: Joi.string().trim().required().messages({
    "string.empty": "Building name is required",
  }),
  buildingType: Joi.string()
    .valid("Public", "Private", "Commercial", "Industrial", "Mixed-Use")
    .required()
    .messages({
      "any.only":
        "Building type must be one of Public, Private, Commercial, Industrial, or Mixed-Use",
      "string.empty": "Building type is required",
    }),
  location: Joi.string().required().messages({
    "string.empty": "Location is required",
  }),
  area: Joi.string().required().messages({
    "string.empty": "Area is required",
  }),
  totalFloors: Joi.number().integer().min(1).required().messages({
    "number.base": "Total floors must be a number",
    "number.min": "Total floors must be at least 1",
  }),
  totalRestrooms: Joi.number().integer().min(1).required().messages({
    "number.base": "Total restrooms must be a number",
    "number.min": "Total restrooms must be at least 1",
  }),
  buildingManager: Joi.string().required().messages({
    "string.empty": "Building manager name is required",
  }),
  contact: Joi.string()
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.pattern.base": "Contact number must only contain digits",
      "string.empty": "Contact number is required",
    }),
  Longitude: Joi.number().required().messages({
    "number.base": "Longitude is required and must be a valid number",
  }),
  Latitude: Joi.number().required().messages({
    "number.base": "Latitude is required and must be a valid number",
  }),
});

