import Joi from "joi";

export const inspectorValidation = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("inspector").required(),
  });
  return schema.validate(data);
};
