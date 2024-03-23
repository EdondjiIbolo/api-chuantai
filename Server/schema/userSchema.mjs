import z from "zod";

const userScheme = z.object({
  name: z.string({
    invalid_type_error: "name must be a string",
    required_error: "name is required",
  }),
  username: z.string({
    invalid_type_error: "username must be a string",
    required_error: "username is required",
  }),
  email: z.string().email({
    invalid_type_error: "email must be a valid email address",
  }),
  password: z.string({
    invalid_type_error: "name must be a string",
    required_error: "password is required",
  }),
  phone: z.string({
    nvalid_type_error: "phone must be a number",
    required_error: "phone is required",
  }),
  rol: z.number().int().default(3),
  verifyCode: z.string(),
});
const quotingScheme = z.object({
  id: z.string(),
  status: z.string(),
  price: z.string({
    nvalid_type_error: "price must be a positive number",
  }),
});
const quotationScheme = z.object({
  Technology: z.string({
    invalid_type_error: "technology must be a string",
    required_error: "name is required",
  }),
  Material: z.string({
    invalid_type_error: "Material must be a string",
    required_error: "Material is required",
  }),
  Finishing: z.string({
    invalid_type_error: "Finishing must be a string",
    required_error: "Finishing is required",
  }),
  Tolerance: z.string({
    invalid_type_error: "Tolerance must be a string",
    required_error: "Tolerance is required",
  }),
  Roughness: z.string({
    invalid_type_error: "Roughness must be a string",
    required_error: "Roughness is required",
  }),
  Threads: z.string({
    invalid_type_error: "Threads must be a string",
    required_error: "Threads is required",
  }),
  lead_time: z.string({
    invalid_type_error: "lead time must be a string",
    required_error: "lead time is required",
  }),
  email: z.string().email(),
  token: z.string({
    invalid_type_error: "token must be a string",
    required_error: "token is required",
  }),
  Quotation_id: z.string({
    invalid_type_error: "Quotation_id must be a string",
    required_error: "Quotation_id is required",
  }),
  address: z.string({
    invalid_type_error: "address must be a string",
    required_error: "address is required",
  }),
  shipping_date: z.string({
    invalid_type_error: "shipping_date must be a string",
    required_error: "shipping_date is required",
  }),
  quantity: z.string({
    invalid_type_error: "quantity must be a string",
    required_error: "quantity is required",
  }),
});
const sendMessageScheme = z.object({
  name: z.string({
    invalid_type_error: "name must be a string",
    required_error: "name is required",
  }),
  surename: z.string({
    invalid_type_error: "surename must be a string",
    required_error: "surename is required",
  }),
  email: z.string().email({
    invalid_type_error: "email must be a valid email address",
  }),
  companyName: z.string({
    invalid_type_error: "companyName must be a string",
    required_error: "companyName is required",
  }),
  phone: z.string({
    nvalid_type_error: "phone must be a number",
    required_error: "phone is required",
  }),
  message: z.string({
    nvalid_type_error: "phone must be a number",
    required_error: "phone is required",
  }),
  check: z.string({
    nvalid_type_error: "check must be a number",
    required_error: "check is required",
  }),
});

export const validateUserlogin = (object) => {
  return userScheme.partial().safeParse(object);
};
export const validateUserSignin = (object) => {
  return userScheme.safeParse(object);
};
export const validateQuotationScheme = (object) => {
  return quotationScheme.safeParse(object);
};
export const validateDataMessage = (object) => {
  return sendMessageScheme.safeParse(object);
};
export const validateDataAssistance = (object) => {
  return quotingScheme.safeParse(object);
};
