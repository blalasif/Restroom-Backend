import Joi from 'joi';

const authValidation = (data) => {
    const schema = Joi.object({
        fullName: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string(),
        phoneNumber: Joi.string(),
        dob: Joi.date(),
        gender: Joi.string(),
        nationality: Joi.string(),
    });

    return schema.validate(data);
};

export default authValidation;
