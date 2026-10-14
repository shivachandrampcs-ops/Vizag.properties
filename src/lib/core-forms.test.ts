import assert from "node:assert/strict";
import test from "node:test";
import { areaUnitLabel, defaultAreaUnitForType, propertyAreaFieldLabel } from "./area-units";
import {
  VIZAG_GVMC_WARD_AREA_NAME_MATCHES,
  VIZAG_LOCATIONS,
  VIZAG_UNVERIFIED_LOCALITY_SUGGESTIONS,
  vizagLocationSearchValues,
} from "./locations";
import { isValidIndianMobile, normalizeIndianMobile } from "./phone";
import { leadSchema, loginSchema, registrationSchema, sellerLoginSchema, sellerProfileSchema } from "./validations";

test("Indian mobile numbers normalize to one canonical +91 form", () => {
  assert.equal(normalizeIndianMobile("98765 43210"), "+919876543210");
  assert.equal(normalizeIndianMobile("+91 (98765) 43210"), "+919876543210");
  assert.equal(isValidIndianMobile("9876543210"), true);
  assert.equal(isValidIndianMobile("5123456789"), false);
  assert.equal(normalizeIndianMobile("12345678901"), null);
});

test("lead enquiries accept absent or blank email but require a valid mobile", () => {
  const base = { name: "A Buyer", phone: "+91 98765 43210" };
  assert.equal(leadSchema.safeParse(base).success, true);
  assert.equal(leadSchema.safeParse({ ...base, email: "" }).success, true);
  assert.equal(leadSchema.safeParse({ ...base, email: "not-an-email" }).success, false);
  assert.equal(leadSchema.safeParse({ name: "A Buyer", email: "" }).success, false);
  assert.equal(leadSchema.safeParse({ name: "A Buyer", phone: "1234567890" }).success, false);
});

test("seller registration requires a valid email and validates contact mobile", () => {
  const registration = {
    accountType: "owner",
    fullName: "A Property Owner",
    companyName: "",
    email: "Owner@Example.com",
    mobile: "9876543210",
    whatsapp: "",
    password: "safe-password-123",
    confirmPassword: "safe-password-123",
    city: "Visakhapatnam",
    locality: "",
    address: "",
  };
  const valid = registrationSchema.safeParse(registration);
  assert.equal(valid.success, true);
  if (valid.success) assert.equal(valid.data.email, "owner@example.com");
  assert.equal(registrationSchema.safeParse({ ...registration, email: "" }).success, false);
  assert.equal(registrationSchema.safeParse({ ...registration, email: "not-an-email" }).success, false);
  assert.equal(registrationSchema.safeParse({ ...registration, mobile: "1234567890" }).success, false);
});

test("seller profiles require a valid account email and contact mobile", () => {
  const profile = {
    name: "A Seller",
    phone: "9876543210",
    email: "seller@example.com",
    companyName: "",
    whatsappNumber: "",
    locality: "",
    city: "Visakhapatnam",
    description: "",
    website: "",
    address: "",
    experienceYears: 0,
    projectsCount: 0,
  };
  assert.equal(sellerProfileSchema.safeParse(profile).success, true);
  assert.equal(sellerProfileSchema.safeParse({ ...profile, email: "" }).success, false);
  assert.equal(sellerProfileSchema.safeParse({ ...profile, phone: "1234567890" }).success, false);
});

test("seller and admin login validate email + password", () => {
  assert.equal(sellerLoginSchema.safeParse({ email: " Seller@Example.com ", password: "password123" }).success, true);
  assert.equal(sellerLoginSchema.safeParse({ email: "not-an-email", password: "password123" }).success, false);
  assert.equal(loginSchema.safeParse({ email: "admin@example.com", password: "password123" }).success, true);
});

test("property area units follow the flat/plot rules and preserve unknown legacy units", () => {
  assert.equal(defaultAreaUnitForType("plot"), "sqft");
  assert.equal(defaultAreaUnitForType("apartment"), "sqyd");
  assert.equal(defaultAreaUnitForType("penthouse"), "sqyd");
  assert.equal(areaUnitLabel("sqft"), "sq. ft.");
  assert.equal(areaUnitLabel("sqyd"), "sq. yd.");
  assert.equal(areaUnitLabel(null), "unit not recorded");
  assert.equal(propertyAreaFieldLabel("plot", "sqft"), "Plot Area (sq. ft.)");
  assert.equal(propertyAreaFieldLabel("apartment", "sqyd"), "Flat Area (sq. yd.)");
});

test("locality suggestions are distinct and legacy search aliases resolve", () => {
  const normalized = VIZAG_LOCATIONS.map((name) => name.toLocaleLowerCase("en-IN"));
  assert.equal(VIZAG_LOCATIONS.length, 112);
  assert.equal(new Set(normalized).size, VIZAG_LOCATIONS.length);
  assert.equal(VIZAG_GVMC_WARD_AREA_NAME_MATCHES.length, 85);
  assert.equal(VIZAG_UNVERIFIED_LOCALITY_SUGGESTIONS.length, 27);
  assert.ok(
    VIZAG_UNVERIFIED_LOCALITY_SUGGESTIONS.every((name) => VIZAG_LOCATIONS.includes(name))
  );
  assert.deepEqual(vizagLocationSearchValues("Bheemunipatnam"), ["Bheemunipatnam", "Bheemili"]);
});
