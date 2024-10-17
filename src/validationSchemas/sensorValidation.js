import Joi from "joi";

const sensorValidation = Joi.object({
  sensorName: Joi.string().required().messages({
    "string.base": '"sensorName" should be a type of text',
    "string.empty": '"sensorName" cannot be an empty field',
    "any.required": '"sensorName" is a required field',
  }),
  type: Joi.string().required().messages({
    "string.base": '"type" should be a type of text',
    "string.empty": '"type" cannot be an empty field',
    "any.required": '"type" is a required field',
  }),
  ip: Joi.string()
    .ip({ version: ["ipv4", "ipv6"] })
    .required()
    .messages({
      "string.base": '"ip" should be a type of text',
      "string.empty": '"ip" cannot be an empty field',
      "string.ip": '"ip" must be a valid IP address',
      "any.required": '"ip" is a required field',
    }),
  port: Joi.number().integer().min(1).max(65535).required().messages({
    "number.base": '"port" should be a type of number',
    "number.integer": '"port" must be an integer',
    "number.min": '"port" must be between 1 and 65535',
    "number.max": '"port" must be between 1 and 65535',
    "any.required": '"port" is a required field',
  }),
  url: Joi.string().uri().required().messages({
    "string.base": '"url" should be a type of text',
    "string.empty": '"url" cannot be an empty field',
    "string.uri": '"url" must be a valid URI',
    "any.required": '"url" is a required field',
  }),
  location: Joi.string().required().messages({
    "string.base": '"location" should be a type of text',
    "string.empty": '"location" cannot be an empty field',
    "any.required": '"location" is a required field',
  }),
  uniqueId: Joi.string().required(),
  status: Joi.string().valid("active", "inactive").optional(),
  isConnected: Joi.boolean().optional(),
});

export default sensorValidation;
