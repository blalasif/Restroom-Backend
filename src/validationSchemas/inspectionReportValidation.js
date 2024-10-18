import Joi from "joi";

export const inspectionReportSchema = Joi.object({
  issues: Joi.array()
    .items(
      Joi.object({
        restroomId: Joi.string().required().messages({
          "any.required": "Restroom ID is required.",
          "string.empty": "Restroom ID cannot be empty.",
        }),
        title: Joi.string().required().messages({
          "any.required": "Issue title is required.",
          "string.empty": "Issue title cannot be empty.",
        }),
        rating: Joi.number().required().min(1).max(5).messages({
          "any.required": "Rating is required.",
          "number.base": "Rating must be a number.",
          "number.min": "Rating must be at least 1.",
          "number.max": "Rating must be at most 5.",
        }),
      })
    )
    .required()
    .messages({
      "any.required": "Issues array is required.",
      "array.base": "Issues must be an array.",
    }),
});
