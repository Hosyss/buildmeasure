/**
 * Shared exact unit constants.
 *
 * References:
 * - NIST Handbook 44, Appendix C
 * - NIST SP 811, Appendix B
 */

export const METERS_PER_FOOT = 0.3048;
export const METERS_PER_INCH = 0.0254;
export const METERS_PER_CENTIMETER = 0.01;
export const METERS_PER_MILLIMETER = 0.001;
export const METERS_PER_YARD = 0.9144;
export const KILOGRAMS_PER_POUND = 0.45359237;
export const POUNDS_PER_SHORT_TON = 2000;
export const KILOGRAMS_PER_METRIC_TONNE = 1000;
export const MILLIMETERS_PER_INCH =
  METERS_PER_INCH / METERS_PER_MILLIMETER;
export const CENTIMETERS_PER_INCH =
  METERS_PER_INCH / METERS_PER_CENTIMETER;
export const SQUARE_METERS_PER_SQUARE_FOOT = METERS_PER_FOOT ** 2;
export const CUBIC_METERS_PER_CUBIC_FOOT = METERS_PER_FOOT ** 3;
export const CUBIC_METERS_PER_CUBIC_YARD = METERS_PER_YARD ** 3;
export const KILOGRAMS_PER_CUBIC_METER_PER_POUND_PER_CUBIC_FOOT =
  KILOGRAMS_PER_POUND / CUBIC_METERS_PER_CUBIC_FOOT;
export const LITERS_PER_CUBIC_METER = 1000;
export const LITERS_PER_CUBIC_FOOT =
  CUBIC_METERS_PER_CUBIC_FOOT * LITERS_PER_CUBIC_METER;
export const LITERS_PER_US_GALLON = 3.785411784;
export const LITERS_PER_US_QUART = LITERS_PER_US_GALLON / 4;

export function formatConvertedInput(
  value: number,
  decimalPlaces = 7,
) {
  if (!Number.isFinite(value)) return "0";

  return String(Number(value.toFixed(decimalPlaces)));
}
