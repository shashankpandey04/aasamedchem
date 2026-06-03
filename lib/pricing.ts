export const ALL_UNITS = ["kg", "g", "L", "mL", "unit"] as const;

export type Unit = (typeof ALL_UNITS)[number];

export function getAllowedUnits(productUnit: Unit) {
  switch (productUnit) {
    case "kg":
    case "g":
      return ["kg", "g"] as const;
    case "L":
    case "mL":
      return ["L", "mL"] as const;
    default:
      return ["unit"] as const;
  }
}

function convertQuantity(quantity: number, fromUnit: Unit, toUnit: Unit) {
  if (fromUnit === toUnit) {
    return quantity;
  }

  if (fromUnit === "kg" && toUnit === "g") {
    return quantity * 1000;
  }

  if (fromUnit === "g" && toUnit === "kg") {
    return quantity / 1000;
  }

  if (fromUnit === "L" && toUnit === "mL") {
    return quantity * 1000;
  }

  if (fromUnit === "mL" && toUnit === "L") {
    return quantity / 1000;
  }

  return null;
}

export function calculateTotalPrice(
  pricePerProductUnit: number,
  productUnit: Unit,
  quantity: number,
  orderUnit: Unit,
) {
  const convertedQuantity = convertQuantity(quantity, orderUnit, productUnit);

  if (convertedQuantity === null) {
    return null;
  }

  return pricePerProductUnit * convertedQuantity;
}
